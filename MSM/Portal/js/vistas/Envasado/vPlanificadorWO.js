define(['underscore', 'backbone', 'jquery', 'kendoTimezones', 'text!../../../Envasado/html/PlanificadorWO.html',
    'compartido/notificaciones', 'jszip', '../../../../Portal/js/constantes', 'vistas/Envasado/vPlanificadorWOExportar', 'vistas/Envasado/vPlanificadorWOCrear'],
    function (_, Backbone, $, kendoTimezones, PlantillaPlanificadorWO, Not, JSZip, enums, vistaExportar, vistaCrear) {
        var planificadorWO = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsGrid: null,
            grid: null,
            sch: null,
            constTipoPreparacion: enums.TipoPreparacionPlanificador(),
            constConfigPreparacion: enums.ConfigPreparacionPlanificador(),
            constUnidadMedida: enums.UnidadDeMedida(),
            constTipoVista: enums.TipoVistaPlanificador(),
            constCandadoEditor: enums.CandadoEditorPlanificador(),
            constModoFechas: enums.ModoFechasPlanificador(),
            constEstadosWO: enums.EstadosWOPlanificador(),
            constOrigenWO: enums.OrigenWO(),
            constEditorWOInput: enums.EditorWOInput(),
            template: _.template(PlantillaPlanificadorWO),
            opciones: null,
            datosMES: null,
            WOSchema: null,
            opcionesMapper: {},
            VelocidadNominalMultiplicador: {
                'MSM.ALOVERA.ENVASADO.AB09': 0.5, 'MSM.ALOVERA.ENVASADO.AC09': 0.5,
                'MSM.SOLAN.ENVASADO.S209': 0.7, 'MSM.SOLAN.ENVASADO.S509': 0.3 },
            initialize: function () {
                window.JSZip = JSZip;

                let self = this;
                
                Backbone.on('expSecuenciadorIniciada', self.ExportacionIniciada, this);
                Backbone.on('expSecuenciadorProgreso', function (data) {
                    self.ExportacionProgreso(data);
                }, this);
                Backbone.on('expSecuenciadorFinalizada', function (result) {
                    self.ExportacionFinalizada(result);
                }, this);

                self.opcionesMapper = {
                    convertirDesdeServidor: function (elem) {
                        let valor = "";

                        switch (elem.Tipo.toLowerCase()) {
                            case "number":
                                valor = Number(elem.Valor);
                                break;
                            case "boolean":
                            case "bool":
                                valor = Boolean("true" == elem.Valor);
                                break;
                            case "date":
                                valor = new Date(elem.Valor);
                                break;
                            case "array":
                                valor = elem.Valor.split(";");
                                break;
                            case "dictionary":
                                let arr = elem.Valor.split(";").filter(f => f != "");
                                valor = {};
                                for (let a of arr) {
                                    let d = a.split(":");
                                    valor[d[0]] = d[1];
                                }
                                break;
                            default:
                                valor = String(elem.Valor);
                        }

                        return {
                            id: elem.Id,
                            clave: elem.Clave,
                            valor: valor,
                            orden: elem.Orden,
                            tipo: elem.Tipo
                        }
                    },
                    comprobarIguales: function (elem, nuevoValor) {

                        switch (elem.tipo.toLowerCase()) {
                            case "date":
                                return elem.valor.getTime() == nuevoValor.getTime();
                            case "array":
                                return JSON.stringify(elem.valor) == JSON.stringify(nuevoValor);
                            case "dictionary":
                                let actualValor = elem.valor[nuevoValor[0]];
                                actualValor = isNaN(actualValor) ? actualValor.toLowerCase() : parseInt(actualValor);
                                nuevoValor[1] = isNaN(nuevoValor[1]) ? nuevoValor[1].toLowerCase() : parseInt(nuevoValor[1]);
                                if (actualValor && actualValor == nuevoValor[1]) {
                                    return true;
                                }
                                return false;
                            case "number":
                            case "boolean":
                            case "bool":
                            default:
                                return elem.valor == nuevoValor
                        }
                    },
                    convertirParaServidor: function (elem) {
                        let valor = "";

                        switch (elem.tipo.toLowerCase()) {
                            case "date":
                                valor = elem.valor.toISOString();
                                break;
                            case "array":
                                valor = elem.valor.join(";");
                                break;
                            case "dictionary":
                                for (let k in elem.valor) {
                                    valor += `${k}:${elem.valor[k]};`
                                }
                                if (valor.length > 0) {
                                    valor = valor.slice(0, -1);
                                }
                                break;
                            case "number":
                            case "boolean":
                            case "bool":
                            default:
                                valor = String(elem.valor);
                        }

                        return {
                            Id: elem.id,
                            Clave: elem.clave,
                            Valor: valor,
                            Tipo: elem.tipo
                        }
                    }
                }

                let splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resize);

                // Evento para avisar de que hay cambios sin guardar al cerrar la página
                window.addEventListener("beforeunload", (evento) => {

                    if (!self.sch || !self.grid) {
                        return;
                    }

                    let modificadosSCH = self.sch.dataSource.data().filter(f => f.modificado() == true);
                    let eliminadosSCH = self.grid.dataSource.data().filter(f => f.temporal);

                    if (modificadosSCH.length || eliminadosSCH.length) {
                        evento.preventDefault();
                        evento.returnValue = "";
                        return "";
                    }
                });

                // Definicion de las clases usadas
                class WO {
                    constructor(orden) {                        
                        // los distintos origenes de las WO pueden ser J si son wo planificadas en JDE, S si ya existen en MES, o M si son creadas a mano
                        let origen = orden.IdWOSecuenciadasMES ? self.constOrigenWO.MES : (orden.IdWOPlanificadasJDE ? self.constOrigenWO.JDE : self.constOrigenWO.MANUAL);
                        let deJDE = origen == self.constOrigenWO.JDE;

                        this.idWO = origen + (orden.IdWOPlanificadasJDE || orden.IdWOSecuenciadasMES || orden.IdManual);
                        this.idOriginal = orden.CodigoOriginal || orden.IdJDE;
                        this.idPlanificadaJDE = orden.IdWOPlanificadasJDE;
                        this.idManual = orden.IdManual;
                        this.idMES = orden.IdMES;
                        this.semana = !deJDE ? new Date(orden.FechaInicioPlanificada).getWeek() : orden.Semana;
                        this.fechaEntrega = orden.FechaEntrega ? new Date(orden.FechaEntrega) : orden.FechaSolicitada ? new Date(orden.FechaSolicitada) : null;
                        this.idProducto = parseInt(orden.IdProducto);
                        this.descripcionProducto = orden.DescripcionProducto;
                        this.cantidad = orden.Cantidad;
                        this.cantidadOriginal = !deJDE ? orden.CantidadOriginal : this.cantidad;
                        this.uom = orden.UOM;
                        this.idLinea = orden.IdLinea;
                        this.idLineas = orden.IdMES ? [orden.IdLinea] : orden.LineasProducto;
                        this.idEstadoWO = orden.IdEstadosWO;
                        this.fechaInicioPlanificado = !deJDE ? new Date(orden.FechaInicioPlanificada) : new Date(this.fechaEntrega.getTime());
                        this.fechaFinPlanificado = !deJDE ? new Date(orden.FechaFinPlanificada) : new Date(this.fechaEntrega.getTime());
                        this.descripcion = orden.Descripcion || "";
                        this.velocidadNominal = orden.VelocidadNominal;
                        this.OEE = orden.OEEPlanificacion;
                        this.TipoPreparacion = orden.TipoPreparacion || "0.0.1";
                        this.TiempoPreparacion = orden.TiempoPreparacion || 0;
                        this.AutoAjuste = orden.AutoAjuste != null ? orden.AutoAjuste : true;

                        // Comprobamos si el array de IdLineas contiene la linea que ha programado JDE, si no vaciamos el array de IdLineas para que aparezca bloqueada
                        if (!this.idLineas.includes(this.idLinea)) {
                            this.idLineas = [];
                        }
                    }
                }

                class Evento {
                    constructor(wo) {
                        this.orden = wo;

                        this.id = wo.idWO;
                        this.nombreWO = wo.idMES || wo.idOriginal;
                        this.title = (this.orden.idManual ? 'M-' : '') + this.nombreWO;
                        this.description = `${wo.idProducto} - ${wo.descripcionProducto}`;
                        this.descripcion = wo.descripcion;
                        this.idLinea = wo.idLinea;
                        this.idLineaAnterior = this.idLinea;
                        this.fechaEntrega = wo.fechaEntrega || wo.fechaFinPlanificado;
                        this.fechaEntregaHelper = kendo.toString(this.fechaEntrega, 'dd/MM/yyyy');
                        this.cantidad = wo.cantidad;
                        this.idProducto = wo.idProducto;
                        this.inicioWO = new Date(wo.fechaInicioPlanificado.getTime());
                        this.inicioWOAnterior = new Date(this.inicioWO.getTime());
                        this.start = new Date(this.inicioWO);
                        this.startAnterior = new Date(this.start.getTime());                        
                        this.end = new Date(wo.fechaFinPlanificado.getTime());
                        this.endAnterior = new Date(this.end.getTime());
                        this.duracion = 0;
                        this.duracionAnterior = 0;
                        this.duracionOffset = 0;

                        this.duracionPreparacion = wo.TiempoPreparacion;
                        this.duracionPreparacionAnterior = this.duracionPreparacion;
                        this.duracionPreparacionOffset = 0;
                        this.tiemposArranque = null;
                        this.tipoPreparacion = wo.TipoPreparacion;
                        this.temporal = false;
                        this.nueva = false;
                        this.visibleEnGrid = true;
                        this.esEditable = this.orden.idEstadoWO <= 2;
                        this.autoAjuste = this.esEditable ? this.orden.AutoAjuste : false;
                        this.autoDate = false;
                        this.inicioFijo = true;
                        this.revisar = false;
                        this.cambiaSemana = false;

                        this.relacionesEnvases = {
                            CPBPalet: null,
                            envasesPalet: null,
                            hectolitrosEnvase: null
                        }
                        this.parametrosLinea = {
                            velocidadNominal: wo.velocidadNominal,
                            OEE: wo.OEE
                        }
                        this.decodificarDatosPreparacion = function () {
                            let datosPrep = {
                                config: 0,
                                tipo: 0,
                                idArranque: 1,
                                tiemposArranque: this.tiemposArranque,
                                duracion: this.duracionPreparacion
                            };

                            [datosPrep.config, datosPrep.tipo, datosPrep.idArranque] = this.tipoPreparacion.split('.').map(m => parseInt(m));

                            return datosPrep;
                        }
                        this.codificarDatosPreparacion = function (datosPrep) {
                            this.tiemposArranque = datosPrep.tiemposArranque;
                            this.duracionPreparacion = datosPrep.duracion;
                            this.tipoPreparacion = [datosPrep.config, datosPrep.tipo, datosPrep.idArranque].join('.');
                        },
                        this.modificado = function () {
                            let res = false;

                            // Condiciones para considerar que la wo ha cambiado y debe actualizarse
                            if (this.esEditable
                                && (this.orden.idPlanificadaJDE != null
                                || this.orden.idManual != null
                                || this.inicioWO.getTime() != this.orden.fechaInicioPlanificado.getTime()
                                || this.end.getTime() != this.orden.fechaFinPlanificado.getTime()
                                || this.cantidad != this.orden.cantidad
                                || this.idLinea != this.orden.idLinea
                                || this.descripcion != this.orden.descripcion
                                || this.tipoPreparacion != this.orden.TipoPreparacion
                                || this.duracionPreparacion != this.orden.TiempoPreparacion
                                || this.autoAjuste != this.orden.AutoAjuste
                                || this.parametrosLinea.OEE != this.orden.OEE
                                || this.parametrosLinea.velocidadNominal != this.orden.velocidadNominal)
                            ) {
                                res = true;
                            }

                            return res;
                        }
                        this.origen = function () {
                            return this.id.slice(0, 1);
                        }
                        this._id = function () {
                            return this.id.slice(1);
                        }
                        this._clonar = function () {
                            let nuevo = new Evento(this.orden);

                            for (let k in this) {
                                nuevo[k] = this[k];
                            }

                            return nuevo;
                        }
                        this._calcularDuracion = function () {
                            this.duracion = this._duracion(this.cantidad);
                            this.end = this._fin();
                        }
                        this._recalcularCantidad = function (sch, nuevaFechaInicio, nuevaFechaFin) {
                            // Si la fecha de inicio ha cambiado la actualizamos
                            if (nuevaFechaInicio.getTime() != this.inicioWO.getTime()) {
                                this.inicioWO = new Date(nuevaFechaInicio.getTime());
                                this.start = nuevaFechaInicio.addMins(-this.duracionPreparacion);
                            }

                            this.cantidad = this._nuevaCantidad(sch, nuevaFechaInicio, nuevaFechaFin);
                        }
                        this._nuevaCantidad = function (sch, nuevaFechaInicio, nuevaFechaFin, velocidad = this._velocidadProduccion()) {

                            let totalTime = (nuevaFechaFin.getTime() - nuevaFechaInicio.getTime()) / 60000;
                            totalTime -= sch.tiempoSinPlanificar(this.idLinea, nuevaFechaInicio.addMins(-this.duracionPreparacion), nuevaFechaFin, false);
                            let relacion = this.relacionesEnvases.envasesPalet;

                            return Math.floor(((totalTime / 60) * velocidad) / relacion);
                        }
                        this._velocidadProduccion = function (velocidadNominal = this.parametrosLinea.velocidadNominal, OEE = this.parametrosLinea.OEE) {
                            return (velocidadNominal * OEE / 100)
                        },
                        this._duracion = function (cantidad, velocidad = this._velocidadProduccion()) {
                            let relacion = this.relacionesEnvases.envasesPalet;
                            let cantidadEnvases = cantidad * relacion;                            

                            return Math.ceil((cantidadEnvases / velocidad) * 60);
                        }
                        this._fin = function () {
                            let nuevoFin = this.inicioWO.addMins(this.duracion + this.duracionOffset);
                            return nuevoFin;
                        }

                        // Comprueba si existe solapamiento de esta wo con otra
                        // Devuelve:
                        // 0 si no hay solapamiento
                        // 1 si la wo empieza dentro de la otra
                        // 2 si la wo acaba dentro de otra
                        // 3 si la wo contiene completamente la otra wo
                        this.solapamiento = function (wo, contarTiempoInicio = true, valoresIniciales = false) {
                            let res = 0;

                            let ai = contarTiempoInicio ? this.start.getTime() : this.inicioWO.getTime();
                            let af = this.end.getTime();
                            let bi = contarTiempoInicio ? wo.start.getTime() : wo.inicioWO.getTime();
                            let bf = wo.end.getTime();

                            if (valoresIniciales) {
                                ai = contarTiempoInicio ? this.startAnterior.getTime() : this.inicioWOAnterior.getTime();
                                af = this.endAnterior.getTime();
                                bi = contarTiempoInicio ? wo.startAnterior.getTime() : wo.inicioWOAnterior.getTime();
                                bf = wo.endAnterior.getTime();
                            }

                            if (ai > bi && ai < bf) {
                                res = 1;
                            }
                            else if (af > bi && af < bf) {
                                res = 2;
                            }
                            else if (ai < bi && af > bf) {
                                res = 3;
                            }

                            return res;
                        }

                        this.convertirParaServidor = function () {
                            return {
                                IdWOSecuenciadasMES: this.origen() == self.constOrigenWO.MES ? this._id() : 0,
                                IdOrden: this.orden.idMES,
                                Cantidad: this.cantidad,
                                CantidadOriginal: this.orden.cantidadOriginal,
                                UOM: this.orden.uom,
                                IdOriginal: this.orden.idPlanificadaJDE,
                                CodigoOriginal: this.orden.idOriginal,
                                IdLinea: this.idLinea,
                                FechaInicioPlanificada: this.inicioWO.toISOString(),
                                FechaFinPlanificada: this.end.toISOString(),
                                FechaEntrega: this.orden.fechaEntrega ? this.orden.fechaEntrega.toISOString() : this.end.toISOString(),
                                IdProducto: this.idProducto,
                                DescripcionProducto: "",
                                Descripcion: this.descripcion,
                                VelocidadNominal: this.parametrosLinea.velocidadNominal,
                                EnvasesPorPalet: this.relacionesEnvases.envasesPalet,
                                CajasPorPalet: this.relacionesEnvases.CPBPalet,
                                HectolitrosProducto: this.relacionesEnvases.hectolitrosEnvase,
                                OEEPlanificacion: this.parametrosLinea.OEE,
                                AutoAjuste: this.autoAjuste,
                                TipoPreparacion: this.tipoPreparacion,
                                TiempoPreparacion: this.duracionPreparacion,
                                CreadoPor: window.app.sesion.attributes.usuario || "",
                                ActualizadoPor: window.app.sesion.attributes.usuario || "",
                            }
                        }
                    }
                }

                window.WO = WO;
                window.Evento = Evento;

                self.WOSchema = {
                    model: {
                        id: "id",
                        fields: {
                            id: { from: "id", type: "string" },
                            idLinea: { from: "idLinea", nullable: false },
                            title: { type: "string", from: "title", defaultValue: "", validation: { required: true } },
                            start: { type: "date", from: "start" },
                            end: { type: "date", from: "end" },                            
                            //startTimezone: { type: "string", from: "startTimezone" },
                            //endTimezone: { type: "string", from: "endTimezone" },
                            description: { from: "description" },
                            cantidad: { from: "cantidad", type: "number" },
                            duracion: { from: "duracion", type: "number" },
                            fechaEntrega: { type: "date", from: "fechaEntrega" },
                            fechaEntregaHelper: { type: "date", from: "fechaEntregaHelper" },
                            semana: { type: "number", from: "orden.semana" },
                            uom: { type: "string", from: "orden.uom" },
                            descripcionProducto: { type: "string", from: "orden.descripcionProducto" },
                            idProducto: { type: "number" },
                        }
                    }
                }

                self.render();
                self.$("[data-funcion]").checkSecurity();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#divHTMLContenido").height("100%");
                $("#schedulerSplitter").height("calc(100% - " + ($("#divCabeceraVista").height() + 5) + "px");

                $("#schedulerSplitter").kendoSplitter({
                    orientation: "vertical",
                    panes: [
                        { collapsible: true, resizable: false, scrollable: false, size: "40px" },
                        { collapsible: false, scrollable: false },
                        { collapsible: true, scrollable: false },
                    ]
                });

                let splitter = $("#schedulerSplitter").data("kendoSplitter");
                splitter.bind("resize", self.resize);

                self.CargaInicialDatos();
            },
            CargaInicialDatos: async function () {
                let self = this;

                kendo.ui.progress($("#divHTMLContenido"), true);

                Promise.all([
                    self.CargarConfiguracion(),
                    self.CargarParametrosLineas(),
                    self.CargarTiemposArranque(),
                    self.CargarTiemposCambio(),
                    self.CargarRelacionEnvasesProductos(),
                    self.CargarParametrosPlanta(),
                    self.ObtenerProductosSIGI()
                ])
                    .then(values => {
                        kendo.ui.progress($("#divHTMLContenido"), false);
                        if (TienePermiso(292)) {
                            $("#btnCargar").attr("disabled", false);
                        }

                        // Para añadir la opción de tiempo desde ultima WO para ser arranque, que viene de los parámetros de planta y no de la configuración
                        let orden = values[0].find(f => f.clave == 'HORAS_SIN_WO_ARRANQUE_LIMPIEZA').orden || 1000;
                        let opt = values[0].map(o => { o.orden = o.orden >= orden ? o.orden + 1 : o.orden; return o; });

                        let horasSinWOValor = {};
                        for (let v of values[5].filter(f => f.IdParametro == 15)) {
                            horasSinWOValor[v.IdLinea] = v.VALOR_FLOAT
                        }

                        opt.push({
                            clave: 'HORAS_SIN_WO_ARRANQUE',
                            id: -1,
                            orden: orden,
                            tipo: 'Dictionary',
                            valor: horasSinWOValor
                        });

                        opt = opt.sort((a, b) => a.orden - b.orden);

                        self.opciones = {
                            actualizado: true
                        };

                        for (let o of opt) {
                            self.opciones[o.clave] = o
                        }

                        self.datosMES = {
                            lineas: window.app.planta.lineas.map(m => {
                                return {
                                    idLinea: m.id,
                                    numLinea: m.numLinea,
                                    numLineaDesc: m.numLineaDescripcion,
                                    descripcion: m.descripcion,
                                    value: m.id,
                                    color: self.opciones["LINEAS_COLOR"].valor[m.numLinea] || "#DDDDDD",
                                    text: ObtenerLineaDescripcion(m.id),
                                    oeeCritico: m.oeeCritico,
                                    oeeObjetivo: m.oeeObjetivo
                                }
                            }),
                            parametrosLinea: values[1],
                            tiemposArranque: values[2],
                            tiemposCambio: values[3],
                            relacionEnvasesProductos: values[4],
                            productosSIGI: values[6]
                        };
                    })
                    .catch(er => {
                        kendo.ui.progress($("#divHTMLContenido"), false);
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), "No se han podido cargar datos de MES " + er.type/*window.app.idioma.t('AVISO_SIN_PERMISOS')*/, 3000);
                    })
            },
            CargarConfiguracion: async function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    // Si las opciones están actualizadas no las recargamos del server
                    if (self.opciones && self.opciones.actualizado) {
                        let res = [];
                        for (let k in self.opciones) {
                            if (k != 'actualizado' && k != 'HORAS_SIN_WO_ARRANQUE') {
                                let o = self.opciones[k];
                                res.push({
                                    id: o.id,
                                    clave: o.clave,
                                    valor: o.valor,
                                    orden: o.orden,
                                    tipo: o.tipo
                                })
                            }
                        }
                        resolve(res);
                        return;
                    }

                    $.ajax({
                        type: "GET",
                        url: "../api/Planificador/Configuracion/",
                        dataType: 'json',
                        success: function (data) {
                            // procesamos la configuracion para convertirla en objeto usable en JS
                            let res = [];

                            for (let c of data) {
                                res.push(self.opcionesMapper.convertirDesdeServidor(c));
                            }

                            resolve(res);
                        },
                        error: function (err) {
                            err.type = "Configuración";
                            reject(err);
                        }
                    });
                });
            },
            CargarParametrosPlanta: async function () {
                let self = this;

                return new Promise((resolve, reject) => {

                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerParametrosPlantaAdmin/",
                        dataType: 'json',
                        success: function (data) {

                            resolve(data);
                        },
                        error: function (err) {
                            err.type = "Parametros planta";
                            reject(err);
                        }
                    });
                });
            },
            CargarParametrosLineas: async function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    // Si los datos están actualizadas no las recargamos del server
                    if (self.datosMES && self.datosMES.parametrosLinea && self.datosMES.parametrosLinea.actualizado) {
                        resolve(self.datosMES.parametrosLinea);
                        return;
                    }

                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerParametrosLinea/",
                        dataType: 'json',
                        success: function (data) {
                            // procesamos los datos
                            let res = {
                                defecto: {
                                    velocidadNominal: 100000,
                                    OEE: 60
                                },
                                actualizado: true,
                                datos: []
                            };

                            for (let d of data) {
                                // Comprobamos si hay definido algún multiplicador de VelocidadNominal para esta linea
                                let vnFinal = d.velocidadNominal;
                                vnFinal *= self.VelocidadNominalMultiplicador[d.idLinea] || 1.0;

                                res.datos.push({
                                    idProducto: d.idProducto,
                                    idLinea: d.idLinea,
                                    velocidadNominal: Math.round(vnFinal),
                                    OEE: d.OEE_preactor
                                });
                            }

                            resolve(res);
                        },
                        error: function (err) {
                            err.type = "Parametros línea";
                            reject(err);
                        }
                    });
                });
            },
            CargarTiemposArranque: async function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    // Si los datos están actualizadas no las recargamos del server
                    if (self.datosMES && self.datosMES.tiemposArranque && self.datosMES.tiemposArranque.actualizado) {
                        resolve(self.datosMES.tiemposArranque);
                        return;
                    }

                    let res = {
                        defecto: {
                            arranques: [
                                { id: 1, nombre: "Inicio + limpieza (def)", tiempo: 190 },
                                { id: 2, nombre: "Inicio (def)", tiempo: 135 },
                            ]
                        },
                        actualizado: true,
                        datos: []
                    };

                    $.ajax({
                        type: "GET",
                        url: "../api/obtenerTiemposArranque/",
                        dataType: 'json',
                        success: function (data) {
                            // procesamos los datos
                            for (let d of data) {
                                let idProducto = d.productoEntrante.codigo;
                                let linea = window.app.planta.lineas.find(f => f.numLinea == d.idLinea);
                                if (linea == null) {
                                    continue;
                                }
                                let idLinea = linea.id;

                                if (!res.datos.find(f => f.idProducto == idProducto && f.idLinea == idLinea)) {
                                    let aux = data.filter(f => f.productoEntrante.codigo == idProducto && f.idLinea == d.idLinea);

                                    aux.sort((a, b) => a.tipoArranque - b.tipoArranque);

                                    res.datos.push({
                                        idProducto: idProducto,
                                        idLinea: idLinea,
                                        arranques: aux.map(m => { return { id: m.tipoArranque, nombre: m.descArranque, tiempo: m.tiempoPreactor } })
                                    });
                                }
                            }

                            resolve(res);
                        },
                        error: function (err) {
                            err.type = "Tiempos Arranque";
                            reject(err);
                        }
                    });
                });
            },
            CargarTiemposCambio: async function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    // Si los datos están actualizadas no las recargamos del server
                    if (self.datosMES && self.datosMES.tiemposCambio && self.datosMES.tiemposCambio.actualizado) {
                        resolve(self.datosMES.tiemposCambio);
                        return;
                    }

                    let res = {
                        defecto: {
                            tiempoCambio: 90
                        },
                        actualizado: true,
                        datos: []
                    };

                    $.ajax({
                        type: "GET",
                        url: "../api/obtenerTiemposCambio/",
                        dataType: 'json',
                        success: function (data) {
                            // procesamos los datos

                            for (let d of data) {
                                let idProductoEntrante = d.productoEntrante.codigo;
                                let idProductoSaliente = d.productoSaliente.codigo;
                                let linea = window.app.planta.lineas.find(f => f.numLinea == d.idLinea);
                                if (linea == null) {
                                    continue;
                                }
                                let idLinea = linea.id;

                                res.datos.push({
                                    idProductoEntrante: idProductoEntrante,
                                    idProductoSaliente: idProductoSaliente,
                                    idLinea: idLinea,
                                    tiempoCambio: d.tiempoPreactor
                                })
                            }

                            resolve(res);
                        },
                        error: function (err) {
                            err.type = "Tiempos Cambio";
                            reject(err);
                        }
                    });
                });
            },
            CargarRelacionEnvasesProductos: async function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    // Si los datos están actualizadas no las recargamos del server
                    if (self.datosMES && self.datosMES.relacionEnvasesProductos && self.datosMES.relacionEnvasesProductos.actualizado) {
                        resolve(self.datosMES.relacionEnvasesProductos);
                        return;
                    }

                    $.ajax({
                        type: "GET",
                        url: "../api/productos/relacionesEnvases/",
                        dataType: 'json',
                        success: function (data) {
                            // procesamos los datos
                            let res = {
                                defecto: {
                                    contenedoresPorPalet: 70,
                                    envasesPorPalet: 1100,
                                    hectolitrosEnvase: 0.035
                                },
                                actualizado: true,
                                datos: []
                            };

                            for (let d of data) {
                                res.datos.push({
                                    idProducto: d.Id,
                                    uom: d.UdMedida,
                                    contenedoresPorPalet: d.CPBPorPalet,
                                    envasesPorPalet: d.EnvasesPorPalet,
                                    hectolitrosEnvase: d.HectolitrosEnvase
                                });
                            }

                            resolve(res);
                        },
                        error: function (err) {
                            err.type = "Relacion Envases";
                            reject(err);
                        }
                    });
                });
            },
            CargarPlanificador: async function (e, cargarWOJDE = true) {
                let self = this;

                let turnosPlanificadosProm = new Promise(function (resolve, reject) {

                    let horizontePasado = new Date()
                        .addDays(self.opciones["OFFSET_VISION_INICIO"].valor)
                        //.addDays(-1)
                        .midnight();
                    let horizonteFuturo = new Date()
                        .addDays(self.opciones["OFFSET_VISION_FIN"].valor)
                        .addDays(1)
                        .midnight();

                    $.ajax({
                        type: "GET",
                        url: `../api/turnos/breaks?fechaInicio=${horizontePasado.toISOString()}&fechaFin=${horizonteFuturo.toISOString()}`,
                        dataType: 'json',
                        success: function (data) {
                            // procesamos los datos
                            let res = [];

                            for (let d of data) {
                                if (d.FechaInicioBreak == null) {
                                    res.push({
                                        idLinea: d.IdLinea,
                                        idturno: d.Id,
                                        inicio: new Date(d.FechaInicio),
                                        fin: new Date(d.FechaFin),
                                        tipo: {
                                            idTipo: d.IdTipoTurno,
                                            nombre: d.TipoTurno
                                        }
                                    });
                                } else {
                                    // primer tramo 
                                    res.push({
                                        idLinea: d.IdLinea,
                                        idturno: d.Id,
                                        inicio: new Date(d.FechaInicio),
                                        fin: new Date(d.FechaInicioBreak),
                                        tipo: {
                                            idTipo: d.IdTipoTurno,
                                            nombre: d.TipoTurno
                                        }
                                    });

                                    // segundo tramo 
                                    res.push({
                                        idLinea: d.IdLinea,
                                        idturno: d.Id,
                                        inicio: new Date(d.FechaFinBreak),
                                        fin: new Date(d.FechaFin),
                                        tipo: {
                                            idTipo: d.IdTipoTurno,
                                            nombre: d.TipoTurno
                                        }
                                    });
                                }
                            }

                            resolve(res);
                        },
                        error: function (err) {
                            err.type = "Turnos planificados";
                            reject(err);
                        }
                    });
                });

                let WOPlanificadasJDEProm = new Promise(async function (resolve, reject) {                    
                    try {
                        if (cargarWOJDE) {
                            await self.CargarWOPlanificadasJDE();
                        }
                        let WOPlanificadasJDE = await self.ObtenerWOPlanificadasJDE();

                        //Convertimos los datos obtenidos para usarlos en el planificador
                        let WOfinal = WOPlanificadasJDE.map(o => new Evento(o));
                        //Añadimos los datos necesarios de MES a las wo
                        WOfinal.map(m => self.AsignarDatosMESWO(m, m.parametrosLinea.velocidadNominal == null, m.relacionesEnvases.envasesPalet == null));

                        resolve(WOfinal);
                    }
                    catch (er) {
                        reject(er)
                    }
                });

                let WOSecuenciadasMESProm = new Promise(async function (resolve, reject) {
                    try {
                        if (cargarWOJDE) {
                            await self.ProcesarWOSecuenciadasMES();
                        }                        

                        let WOSecuenciadasMES = await self.ObtenerWOSecuenciadasMES();
                        WOSecuenciadasMES.map(m => self.AsignarDatosMESWO(m, m.parametrosLinea.velocidadNominal == null, m.relacionesEnvases.envasesPalet == null));

                        resolve(WOSecuenciadasMES);
                    }
                    catch (er) {
                        reject(er)
                    }
                });

                kendo.ui.progress($("#divHTMLContenido"), true);

                self.ComprobarEstadoExportacion()
                    .then((state) => {
                        if (!state) {
                            self.ExportacionActiva();
                        }
                    });

                Promise.all([turnosPlanificadosProm, WOPlanificadasJDEProm, WOSecuenciadasMESProm, self.ObtenerUltimasWOLineas()])
                    .then(values => {
                        let turnosPlanificados = values[0];
                        let WOPlanificadasJDE = values[1];
                        let WOSecuenciadasMES = values[2];
                        let ultimasProducciones = values[3];

                        self.IniciarScheduler(turnosPlanificados, ultimasProducciones, WOSecuenciadasMES);
                        self.IniciarGrid(WOPlanificadasJDE);

                        if (TienePermiso(291)) {
                            $("#btnExportarPlanificacion").attr("disabled", false);
                            $("#btnGuardarPlanificacion").attr("disabled", false);
                            $("#btnExportarBorrador").attr("disabled", false);
                            $("#btnCrearWO").attr("disabled", false);
                        }                        

                        $("#btnLimpiarFiltros").attr("disabled", false);

                        kendo.ui.progress($("#divHTMLContenido"), false);
                    })
                    .catch(er => {
                        kendo.ui.progress($("#divHTMLContenido"), false);
                        console.log("Error cargando el planificador (" + er.type + ")");
                        console.log(er);
                        if (er.type.includes("Cargar")) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANIFICADOR_ERROR_JDE'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANIFICADOR_ERROR_INICIANDO'), 3000);
                        }                        
                    })
            },
            CargarWOPlanificadasJDE: async function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    let horizontePasado = new Date().addDays(-self.opciones["HORIZONTE_PLANIFICACION_PASADO"].valor).midnight();
                    let horizonteFuturo = new Date().addDays(self.opciones["HORIZONTE_PLANIFICACION_FUTURO"].valor + 1).midnight();

                    $.ajax({
                        type: "GET",
                        url: `../api/Planificador/CargarWOPlanificadasJDE`,
                        contentType: "application/json; charset=utf-8",
                        data: {
                            fechaIni: horizontePasado.toISOString(),
                            fechaFin: horizonteFuturo.toISOString()
                        },
                        success: function (data) {
                            resolve();
                        },
                        error: function (err) {
                            err.type = "Cargar WO Planificadas de JDE";
                            reject(err);
                        }
                    });
                });
            },
            ObtenerWOPlanificadasJDE: async function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: `../api/Planificador/WOPlanificadasJDE`,
                        dataType: 'json',
                        success: function (data) {
                            let resultado = data.map(o => new WO(o));

                            resolve(resultado);
                        },
                        error: function (err) {
                            err.type = "Obtener WO Planificadas de JDE";
                            reject(err);
                        }
                    });
                });
            },
            ProcesarWOSecuenciadasMES: async function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    let fechaIni = new Date().addDays(self.opciones["OFFSET_VISION_INICIO"].valor).midnight();
                    let fechaFin = new Date().addDays(self.opciones["OFFSET_VISION_FIN"].valor + 1).midnight();

                    $.ajax({
                        type: "GET",
                        url: `../api/Planificador/ProcesarWOSecuenciadasMES`,
                        contentType: "application/json; charset=utf-8",
                        data: {
                            fechaIni: fechaIni.toISOString(),
                            fechaFin: fechaFin.toISOString()
                        },
                        success: function (data) {
                            resolve();
                        },
                        error: function (err) {
                            err.type = "Procesar WO Secuenciadas de MES";
                            reject(err);
                        }
                    });
                });
            },
            ObtenerWOSecuenciadasMES: async function () {
                let self = this;

                return new Promise((resolve, reject) => {

                    let fechaIni = new Date().addDays(self.opciones["OFFSET_VISION_INICIO"].valor).midnight();
                    let fechaFin = new Date().addDays(self.opciones["OFFSET_VISION_FIN"].valor + 1).midnight();

                    $.ajax({
                        type: "GET",
                        url: `../api/Planificador/WOSecuenciadasMES`,
                        dataType: 'json',
                        data: {
                            fechaIni: fechaIni.toISOString(),
                            fechaFin: fechaFin.toISOString()
                        },
                        success: function (data) {
                            let resultado = data.map(o => new WO(o)).map(o => new Evento(o));

                            resolve(resultado);
                        },
                        error: function (err) {
                            err.type = "Obtener WO Secuenciadas de MES";
                            reject(err);
                        }
                    });
                });
            },
            ObtenerUltimasWOLineas: async function () {
                let self = this;

                return new Promise((resolve, reject) => {

                    let fecha = new Date().addDays(self.opciones["OFFSET_VISION_INICIO"].valor).midnight();

                    $.ajax({
                        type: "GET",
                        url: `../api/Planificador/UltimasProducciones`,
                        dataType: 'json',
                        data: {
                            fecha: fecha.toISOString()
                        },
                        success: function (data) {
                            let resultado = data.map(o => {
                                return {
                                    idLinea: o.IdLinea,
                                    fecha: new Date(o.FechaFin), //.getTime() < fecha ? new Date(o.FechaFin) : fecha,
                                    idProducto: o.IdProducto
                                }
                            });

                            resolve(resultado);
                        },
                        error: function (err) {
                            err.type = "Obtener última producción de WO en MES";
                            reject(err);
                        }
                    });
                });
            },
            ObtenerProductosSIGI: async function () {
                let self = this;

                return new Promise((resolve, reject) => {

                    $.ajax({
                        type: "GET",
                        url: `../api/Planificador/ProductosSIGI`,
                        dataType: 'json',                        
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (err) {
                            err.type = "Obtener productos SIGI";
                            reject(err);
                        }
                    });
                });
            },
            AsignarDatosMESWO: function (wo, paramsLinea, relacionesEnvases) {
                let self = this;
                let refreshWO = false;

                if (paramsLinea && self.datosMES.parametrosLinea) {
                    let d = self.datosMES.parametrosLinea.datos.find(f => f.idLinea == wo.idLinea && f.idProducto == wo.idProducto);
                    if (!d) {
                        d = self.datosMES.parametrosLinea.defecto;
                        //console.log("No existen parametros de linea para linea: " + wo.idLinea + " y producto: " + wo.idProducto);
                    }

                    wo.parametrosLinea.velocidadNominal = d.velocidadNominal;
                    wo.parametrosLinea.OEE = d.OEE;

                    refreshWO = true;
                }

                if (relacionesEnvases && self.datosMES.relacionEnvasesProductos) {
                    let d = self.datosMES.relacionEnvasesProductos.datos.find(f => f.idProducto == wo.idProducto);
                    if (!d) {
                        d = self.datosMES.relacionEnvasesProductos.defecto;
                        //console.log("No existen datos de relaciones para producto: " + wo.idProducto);
                    }

                    wo.relacionesEnvases.CPBPalet = d.contenedoresPorPalet;
                    wo.relacionesEnvases.envasesPalet = d.envasesPorPalet;
                    wo.relacionesEnvases.hectolitrosEnvase = d.hectolitrosEnvase;

                    refreshWO = true;
                }

                // Cargamos la lista de arranques para esta linea y producto
                if (self.datosMES.tiemposArranque) {
                    let d = self.datosMES.tiemposArranque.datos.find(f => f.idLinea == wo.idLinea && f.idProducto == wo.idProducto);
                    if (!d) {
                        d = self.datosMES.tiemposArranque.defecto;
                        //console.log("No existen datos de tiempo arranque para linea: " + idLinea + " y producto: " + idProducto);
                    }

                    wo.tiemposArranque = d.arranques;
                }

                if (refreshWO) {
                    wo._calcularDuracion();
                }
            },
            // Esta función devuelve un objeto con los datos de tiempo inicial que tendrá una WO en una fecha concreta
            // Si se pasa woAnterior no se buscará en las wo de esa línea, de lo contrario se buscará cual es la anterior
            // Se considerará que una WO está antes si el inicio de la nueva es posterior a un tercio de su duración
            ObtenerTiempoPreparacionWO: function (idWO, autoAjuste, datosPrepWO, idLinea, start, idProducto, sch, woAnterior) {
                let self = this;
                let datosPrep = { ...datosPrepWO };

                if (!datosPrep.tiemposArranque && self.datosMES.tiemposArranque) {
                    let d = self.datosMES.tiemposArranque.datos.find(f => f.idLinea == idLinea && f.idProducto == idProducto);
                    if (!d) {
                        d = self.datosMES.tiemposArranque.defecto;
                        //console.log("No existen datos de tiempo arranque para linea: " + idLinea + " y producto: " + idProducto);
                    }

                    datosPrep.tiemposArranque = d.arranques;
                    if (!datosPrep.tiemposArranque.find(f => f.id == datosPrep.idArranque)) {
                        datosPrep.idArranque = 1;
                    }
                }

                if (datosPrep.config == self.constConfigPreparacion.Manual || !autoAjuste) {
                    return datosPrep;
                }

                let idProductoAnterior = 0;
                let fechaAnterior = null;

                if (!woAnterior) {
                    let wos = sch.dataSource.data().filter(f => f.id != idWO && f.idLinea == idLinea && start.getTime() >= f.inicioWO.addMins((f.duracion + f.duracionOffset) / 3).getTime());
                    if (wos.length) {
                        let aux = wos.sort((a, b) => b.inicioWO - a.inicioWO)[0];
                        idProductoAnterior = aux.idProducto;
                        fechaAnterior = aux.end.addSecs(0);
                    }
                } else {
                    idProductoAnterior = woAnterior.idProducto;
                    fechaAnterior = woAnterior.end.addSecs(0);
                }

                if (datosPrep.config == self.constConfigPreparacion.Automatico) {
                    let numLinea = self.datosMES.lineas.find(f => f.idLinea == idLinea).numLinea || 0;
                    let tiempoArranque = self.opciones["HORAS_SIN_WO_ARRANQUE"].valor[numLinea] || 8;
                    let tiempoArranqueLimpieza = self.opciones["HORAS_SIN_WO_ARRANQUE_LIMPIEZA"].valor[numLinea] || 24;   

                    if (fechaAnterior == null) {
                        let ultimaProduccion = sch.ultimasProducciones.find(f => f.idLinea == idLinea);
                        if (ultimaProduccion != null) {
                            fechaAnterior = new Date(ultimaProduccion.fecha.getTime());
                            idProductoAnterior = ultimaProduccion.idProducto;
                        } else {
                            // Si no tenemos datos de la última producción, le ponemos una fecha lejana para que se considere un arranque
                            fechaAnterior = new Date().addDays(-365);
                        }
                    }

                    if (start.addMins(-(tiempoArranque * 60)) < fechaAnterior) {
                        // Es un cambio
                        datosPrep.tipo = self.constTipoPreparacion.Cambio;
                    } else {
                        // Arranque
                        datosPrep.tipo = self.constTipoPreparacion.Arranque;

                        // comprobamos si normal o con limpieza
                        if (start.addMins(-(tiempoArranqueLimpieza * 60)) < fechaAnterior) {
                            // Arranque Normal
                            datosPrep.idArranque = 2;
                        } else {
                            // Arranque Limpieza
                            datosPrep.idArranque = 1;
                        }
                    }                        
                }

                // Arranque
                if (datosPrep.tipo == self.constTipoPreparacion.Arranque) {
                    datosPrep.duracion = datosPrep.tiemposArranque.find(f => f.id == datosPrep.idArranque).tiempo || 0;
                }

                // Cambio
                if (datosPrep.tipo == self.constTipoPreparacion.Cambio) {
                    if (self.datosMES.tiemposCambio) {
                        let d = self.datosMES.tiemposCambio.datos.find(f => f.idLinea == idLinea && f.idProductoEntrante == idProducto && f.idProductoSaliente == idProductoAnterior);
                        if (!d) {
                            d = self.datosMES.tiemposCambio.defecto;
                            //console.log("No existen datos de tiempo cambio para linea: " + idLinea + ", productoSaliente: " + idProductoAnterior + " y productoEntrante: " + idProducto);
                        }

                        datosPrep.duracion = d.tiempoCambio;
                    }
                }

                return datosPrep;
            },           
            IniciarScheduler: function (turnosPlanificados, ultimasProducciones, WOSecuenciadasMES) {
                let self = this;

                kendo.ui.Scheduler.prototype.bbView = self;

                if (!kendo.ui.Scheduler.prototype.turnoPlanificado) {
                    // Añadimos varias funciones extra al scheduler de kendo para gestionar la planificación de WO
                    // Devuelve el turno planificado en el que se encuentre la fecha introducida
                    kendo.ui.Scheduler.prototype.turnoPlanificado = function (idLinea, fecha) {
                        let resultado = null;
                        if (this.turnosPlanificados) {
                            let turnosLinea = this.turnosPlanificados.filter(f => f.idLinea == idLinea);

                            resultado = turnosLinea.find(f => fecha.getTime() >= f.inicio.getTime() && fecha.getTime() <= f.fin.getTime());
                        }

                        return resultado;
                    }

                    // Devuelve el siguiente turno planificado desde la fecha indicada
                    kendo.ui.Scheduler.prototype.siguienteTurnoPlanificado = function (idLinea, fecha) {
                        let resultado = null;
                        if (this.turnosPlanificados) {
                            let turnosLinea = this.turnosPlanificados.filter(f => f.idLinea == idLinea);

                            resultado = turnosLinea.find(f => f.inicio.getTime() > fecha.getTime());
                        }

                        return resultado;
                    }

                    // Devuelve el anterior turno planificado desde la fecha indicada
                    kendo.ui.Scheduler.prototype.anteriorTurnoPlanificado = function (idLinea, fecha) {
                        let resultado = null;
                        if (this.turnosPlanificados) {
                            let turnosLinea = this.turnosPlanificados.filter(f => f.idLinea == idLinea).sort((a, b) => b.inicio - a.inicio);

                            resultado = turnosLinea.find(f => f.fin.getTime() < fecha.getTime());
                        }

                        return resultado;
                    }

                    // Devuelve el tiempo total no planificado que hay entre 2 fechas.
                    kendo.ui.Scheduler.prototype.tiempoSinPlanificar = function (idLinea, fechaInicio, fechaFin, contarInicioYFin = true) {

                        let resultado = 0;
                        let turnoInicio = this.turnoPlanificado(idLinea, fechaInicio);

                        if (this.turnosPlanificados) {
                            let turnosLinea = this.turnosPlanificados.filter(f => f.idLinea == idLinea);

                            let huecosSinPlanificar = [];

                            for (let i = 0; i < turnosLinea.length; i++) {
                                let turnoSiguiente = turnosLinea[i + 1];
                                if (!turnoSiguiente) {
                                    continue;
                                }

                                if (turnosLinea[i].fin.getTime() != turnoSiguiente.inicio.getTime()) {
                                    huecosSinPlanificar.push({
                                        inicio: new Date(turnosLinea[i].fin),
                                        fin: new Date(turnoSiguiente.inicio),
                                        duracion: (turnoSiguiente.inicio - turnosLinea[i].fin) / 60000
                                    })
                                }
                            }

                            // Hueco al inicio
                            let intervalos = [];

                            let intervaloInicial = huecosSinPlanificar.find(f => fechaInicio.getTime() >= f.inicio.getTime() && fechaInicio.getTime() < f.fin.getTime());
                            if (contarInicioYFin && intervaloInicial) {
                                intervalos.push(intervaloInicial);
                            }

                            // Huecos que caigan dentro del rango
                            let intervalosInternos = huecosSinPlanificar.filter(f => !intervalos.includes(f) && fechaInicio.getTime() <= f.inicio.getTime() && fechaFin.getTime() >= f.fin.getTime());
                            if (intervalosInternos.length > 0) {
                                intervalos = intervalos.concat(intervalosInternos);
                            }

                            // Hueco al final
                            let intervaloFinal = huecosSinPlanificar.find(f => !intervalos.includes(f) && fechaFin.getTime() > f.inicio.getTime() && fechaFin.getTime() <= f.fin.getTime());
                            if (contarInicioYFin && intervaloFinal) {
                                intervalos.push(intervaloFinal);
                            }

                            resultado = intervalos.reduce((a, c) => { return a + c.duracion }, 0);
                        }

                        if (!turnoInicio) {
                            //resultado = -1;
                        }

                        return resultado;
                    }

                    // Devuelve un objeto que representa el tiempo no planificado entre 2 fechas (usado para pintar las celdas no planificadas)
                    kendo.ui.Scheduler.prototype.noPlanificado = function (idLinea, fechaInicio, fechaFin) {

                        let resultado = new Array();

                        if (this.turnosPlanificados) {
                            let turnosLinea = this.turnosPlanificados.filter(f => f.idLinea == idLinea);

                            //Comprobamos si existe turno planificado que toque ese rango

                            let planificados = turnosLinea.filter(f => (f.fin.getTime() > fechaInicio.getTime() && f.fin.getTime() <= fechaFin.getTime()) ||
                                (f.inicio.getTime() >= fechaInicio.getTime() && f.fin.getTime() <= fechaFin.getTime()) ||
                                (f.inicio.getTime() >= fechaInicio.getTime() && f.inicio.getTime() < fechaFin.getTime()) ||
                                (f.inicio.getTime() < fechaInicio.getTime() && f.fin.getTime() > fechaFin.getTime()));

                            if (planificados.length > 0) {
                                let huecosSinPlanificar = [];

                                for (let i = 0; i < turnosLinea.length; i++) {
                                    let turnoSiguiente = turnosLinea[i + 1];
                                    let minsAnio = 60 * 24 * 365;
                                    if (!turnoSiguiente) {
                                        // Añadimos rango posterior con duracion de un año hacia delante   
                                        huecosSinPlanificar.push({
                                            inicio: new Date(turnosLinea[i].fin),
                                            fin: turnosLinea[i].inicio.addMins(minsAnio),
                                            duracion: minsAnio
                                        })
                                        continue;
                                    }

                                    if (i == 0) {
                                        // Añadimos rango anterior con duracion de un año hacia atrás        
                                        huecosSinPlanificar.push({
                                            inicio: turnosLinea[i].inicio.addMins(-minsAnio),
                                            fin: new Date(turnosLinea[i].inicio),
                                            duracion: minsAnio
                                        })
                                    }

                                    if (turnosLinea[i].fin.getTime() != turnoSiguiente.inicio.getTime()) {
                                        huecosSinPlanificar.push({
                                            inicio: new Date(turnosLinea[i].fin),
                                            fin: new Date(turnoSiguiente.inicio),
                                            duracion: (turnoSiguiente.inicio - turnosLinea[i].fin) / 60000
                                        })
                                    }
                                }

                                // Filtramos todos los huecos que tocan la ventana de tiempo
                                let huecos = huecosSinPlanificar.filter(f => (f.fin.getTime() > fechaInicio.getTime() && f.fin.getTime() <= fechaFin.getTime()) ||
                                    (f.inicio.getTime() >= fechaInicio.getTime() && f.fin.getTime() <= fechaFin.getTime()) ||
                                    (f.inicio.getTime() >= fechaInicio.getTime() && f.inicio.getTime() < fechaFin.getTime()) ||
                                    (f.inicio.getTime() < fechaInicio.getTime() && f.fin.getTime() > fechaFin.getTime()));

                                huecos.sort((a, b) => a.inicio - b.inicio);

                                let total = fechaFin - fechaInicio;

                                for (let h of huecos) {
                                    let res = {
                                        inicio: h.inicio.getTime() < fechaInicio.getTime() ? fechaInicio : h.inicio,
                                        fin: h.fin.getTime() > fechaFin.getTime() ? fechaFin : h.fin,
                                        izquierda: 0,
                                        derecha: 0,
                                        ancho: 100
                                    };

                                    if (res.inicio.getTime() > fechaInicio.getTime()) {
                                        res.izquierda = (res.inicio - fechaInicio) * 100.0 / total;
                                        res.ancho -= res.izquierda;
                                    }
                                    if (res.fin.getTime() < fechaFin.getTime()) {
                                        res.derecha = (fechaFin - res.fin) * 100.0 / total;
                                        res.ancho -= res.derecha;
                                    }

                                    resultado.push(res);
                                }
                            }
                            else {
                                resultado.push({
                                    inicio: fechaInicio,
                                    fin: fechaFin,
                                    izquierda: 0,
                                    derecha: 0,
                                    ancho: 100
                                })
                            }
                        }

                        return resultado;
                    }

                    // Devuelve los minutos que representa un slot o celda del scheduler
                    kendo.ui.Scheduler.prototype.tiempoCelda = function () {
                        let ticksCelda = this.view().options.majorTick / (this.view().options.minorTickCount || 1);

                        return ticksCelda;
                    }

                    // Devuelve el factor de ancho de los slots o celdas del scheduler según el tiempo que representen
                    kendo.ui.Scheduler.prototype.anchoCelda = function () {
                        let anchoCelda = this.element.find(".k-scheduler-table td").first()[0].getBoundingClientRect().width //.outerWidth();

                        return anchoCelda;
                    }

                    // Devuelve el ancho de un elemento de duracion X, proporcional al ancho de los slots del scheduler
                    kendo.ui.Scheduler.prototype.anchoPorDuracion = function (duracion) {
                        let ticksCelda = this.tiempoCelda();
                        let anchoCelda = this.anchoCelda();
                        return duracion / ticksCelda * anchoCelda;
                    }

                    // devuelve el ultimo turno planificado de la linea especificada
                    kendo.ui.Scheduler.prototype.ultimoTurno = function (idLinea) {
                        let resultado = null;

                        if (this.turnosPlanificados) {
                            let turnosLinea = this.turnosPlanificados.filter(f => f.idLinea == idLinea);
                            resultado = turnosLinea[turnosLinea.length - 1];
                        }

                        return resultado;
                    }
                    // devuelve el ultimo turno planificado de la semana y linea especificada
                    kendo.ui.Scheduler.prototype.ultimoTurnoSemana = function (idLinea, semana) {
                        let resultado = null;

                        if (this.turnosPlanificados) {
                            let turnosLinea = this.turnosPlanificados.filter(f => f.idLinea == idLinea && f.inicio.getWeek() == semana);
                            resultado = turnosLinea[turnosLinea.length - 1];
                        }

                        return resultado;
                    }

                    // Devuelve la posicion en el calendario del final de la planificación (usado para bloquear el movimiento de WO fuera del rango planificado)
                    kendo.ui.Scheduler.prototype.posicionFinalPlanificada = function (idLinea) {
                        let resultado = 0;

                        if (this.turnosPlanificados) {
                            let turnosLinea = this.turnosPlanificados.filter(f => f.idLinea == idLinea);
                            let ultimoTurno = turnosLinea[turnosLinea.length - 1];

                            let lineaSlots = this.view().content.find(`.sub_slot[data-id_linea="${idLinea}"]`);
                            let slotFinal = lineaSlots.filter((idx, elem) => $(elem).data("fecha_inicio") <= ultimoTurno.fin.addSecs(1).getTime() && $(elem).data("fecha_fin") >= ultimoTurno.fin.getTime());
                            resultado = slotFinal.length > 0 ? slotFinal.find(".notPlannedSlot:last-child").offset().left : 0;
                        }

                        return resultado;
                    }

                    // Devuelve el primer slot de la vista en la linea asociada
                    kendo.ui.Scheduler.prototype.primerSlot = function (idLinea) {
                        let resultado = null;

                        resultado = this.view().content.find(`.sub_slot[data-id_linea="${idLinea}"]:first`).parent();

                        if (resultado.length == 0) {
                            resultado = null;
                        }

                        return resultado;
                    }

                    // Devuelve la configuración necesaria para mostrar correctamente la plantilla del evento
                    kendo.ui.Scheduler.prototype.configurarEventoWO = function (uid) {

                        let data = this.occurrenceByUid(uid);
                        let resultado = {
                            tiempoPreparacion: {
                                class: "",
                                style: "",
                                mostrarTiempo: true
                            },
                            wo: {
                                style: "",
                                titleStyle: ""
                            }
                        }

                        let evento = $(".k-event:not(.k-event-drag-hint)[data-uid='" + uid + "']");

                        if (data) {
                            let tiempoTotal = (data.end.getTime() - data.start.getTime()) / 60000;

                            let anchoTiempoInicial = this.anchoPorDuracion(data.duracionPreparacion + data.duracionPreparacionOffset);
                            let anchoWO = this.anchoPorDuracion(tiempoTotal - data.duracionPreparacion - data.duracionPreparacionOffset);

                            if (anchoTiempoInicial < 40) {
                                resultado.tiempoPreparacion.mostrarTiempo = false;
                            }

                            let fechaInicialView = this.view().startDate();
                            let fechaFinalView = this.view().endDate().addMins(1440);
                            let diferenciaBordes = 0;
                            if (fechaInicialView.getTime() > data.start.getTime()) {
                                // la WO se sale del Scheduler por la IZQ
                                diferenciaBordes = this.anchoPorDuracion((fechaInicialView.getTime() - data.start.getTime()) / 60000);
                                anchoWO -= diferenciaBordes > anchoTiempoInicial ? diferenciaBordes - anchoTiempoInicial : 0;
                                anchoTiempoInicial = Math.max(anchoTiempoInicial - diferenciaBordes, 0);
                            }
                            if (fechaFinalView.getTime() < data.end.getTime()) {
                                // la WO se sale del Scheduler por la DCHA
                                diferenciaBordes = this.anchoPorDuracion((data.end.getTime() - fechaFinalView.getTime()) / 60000);
                                anchoTiempoInicial -= diferenciaBordes > anchoWO ? diferenciaBordes - anchoWO : 0;
                                anchoWO = Math.max(anchoWO - diferenciaBordes, 0);
                            }
                            anchoWO = Math.floor(anchoWO);
                            anchoTiempoInicial = Math.floor(anchoTiempoInicial);

                            let bbView = this.bbView;

                            let tipoPreparacion = data.decodificarDatosPreparacion().tipo;
                            let configPreparacion = data.decodificarDatosPreparacion().config;
                            resultado.tiempoPreparacion.class =
                                configPreparacion == bbView.constConfigPreparacion.Manual ? "prepManual" :
                                tipoPreparacion == bbView.constTipoPreparacion.Arranque ? "prepArranque" :
                                    "prepCambio";

                            if (bbView.opciones && bbView.opciones["TIEMPO_PREPARACION_COLOR"]) {
                                let tColor =
                                    configPreparacion == bbView.constConfigPreparacion.Manual ? bbView.opciones["TIEMPO_PREPARACION_COLOR"].valor["MANUAL"] :
                                    tipoPreparacion == bbView.constTipoPreparacion.Arranque ? bbView.opciones["TIEMPO_PREPARACION_COLOR"].valor["ARRANQUE"] :
                                    bbView.opciones["TIEMPO_PREPARACION_COLOR"].valor["CAMBIO"];

                                resultado.tiempoPreparacion.style = `background-color:${tColor}; color:${ColorTextoBlancoNegro(tColor)};`;
                            }
                            resultado.tiempoPreparacion.style += `width:${anchoTiempoInicial}px;`

                            resultado.wo.style = `left:${anchoTiempoInicial}px;width:${anchoWO}px;${(anchoWO < 2 ? "border-width:0px;" : "")}`

                            if (data.revisar || (data.esEditable && !data.autoAjuste)) {
                                let letraClara = false;
                                if (bbView.opciones && bbView.opciones["LINEAS_COLOR"] && bbView.datosMES && bbView.datosMES.lineas) {
                                    let lineNumber = bbView.datosMES.lineas.find(f => f.idLinea == data.idLinea).numLinea;
                                    letraClara = ColorTextoBlancoNegro(bbView.opciones["LINEAS_COLOR"].valor[lineNumber]) == "#FFF";
                                }

                                if (letraClara) {
                                    if (data.revisar) {
                                        // Azul claro
                                        resultado.wo.titleStyle = `color:#9292ff;`;
                                    }
                                    else {
                                        // Rojo claro
                                        resultado.wo.titleStyle = `color:#ff8181;`;
                                    }
                                }
                                else {
                                    if (data.revisar) {
                                        // Azul oscuro
                                        resultado.wo.titleStyle = `color:blue;`;
                                    }
                                    else {
                                        // Rojo oscuro
                                        resultado.wo.titleStyle = `color:red;`;
                                    }
                                }
                            }

                            if (evento.length == 0) {
                                // En el frame que se llama a esta función todavía no existe el evento html en el scheduler, por lo que esperamos al frame siguiente con un temporizador
                                setTimeout(() => {

                                    evento = $(".k-event:not(.configured,.k-event-drag-hint)[data-uid='" + uid + "']");

                                    if (evento.length > 0) {
                                        if (!data.esEditable) {
                                            evento.find(".k-resize-handle").remove();
                                            if (data.orden.idEstadoWO == 3) {
                                                evento.find(".k-event-delete").remove();
                                            }                                            
                                            return;
                                        }
                                        // Esto sirve para detectar si estamos haciendo resize desde el principio de la WO o desde el final
                                        evento.find(".k-resize-w").mouseover((e) => { this.resizeDesdeInicioWO = true });
                                        evento.find(".k-resize-e").mouseover((e) => { this.resizeDesdeInicioWO = false });
                                        evento.find(".k-resize-w").mousedown((e) => { this.ctrlKeyPressed = e.ctrlKey; });
                                        evento.find(".k-resize-e").mousedown((e) => { this.ctrlKeyPressed = e.ctrlKey; });

                                        let offset = evento.find(".tiempoPreparacionWO").outerWidth();
                                        let anchoWO = evento.find(".order_cell").outerWidth();
                                        evento.find("span.k-resize-w").css("left", (offset + 2 - (anchoWO < 8 ? 8 : 0)) + "px");

                                        evento.addClass("configured");
                                    }
                                });
                            }
                        }

                        return resultado;
                    }

                    // Ajusta el hint al arrastrar una WO para que siempre se muestre bien
                    kendo.ui.Scheduler.prototype.configuracionHintWO = function (hint, dataItem) {

                        hint.css("width", this.anchoPorDuracion(dataItem.duracion + dataItem.duracionPreparacion) + "px");
                        if (this.anchoPorDuracion(dataItem.duracionPreparacion) < 40) {
                            hint.find(".tiempoPreparacionWO :first-child").hide()
                        }
                        hint.find(".tiempoPreparacionWO").css("width", this.anchoPorDuracion(dataItem.duracionPreparacion) + "px");
                        hint.find(".tiempoPreparacionWO").css({
                            "height": "50%",
                            "top": "25%"
                        });
                        hint.find(".tiempoPreparacionWO span").html(kendo.toString(new Date(0, 0, 0, 0, dataItem.duracionPreparacion), 'H:mm'));

                        let color = "";
                        let lineas = this.resources.find(f => f.field == "idLinea");
                        if (lineas) {
                            let linea = lineas.dataSource.data().filter(f => f.value == dataItem.idLinea);
                            if (linea.length > 0) {
                                color = linea[0].color;
                            }
                        }
                        hint.find(".order_cell").css({
                            "width": this.anchoPorDuracion(dataItem.duracion) + "px",
                            "left": this.anchoPorDuracion(dataItem.duracionPreparacion) + "px",
                            "background-color": color,
                            "color": ColorTextoBlancoNegro(color)
                        });
                    }

                    // Muestra las horas de inicio y fin del evento en el hint al arrastrar
                    kendo.ui.Scheduler.prototype.mostrarHorasHint = function (hint, fechaCelda, evento) {
                        let fechaInicio = fechaCelda ? new Date(fechaCelda) : new Date(evento.start);
                        let fechaFin = fechaInicio.addMins(evento.duracion);

                        if (hint.find(".hint-hours-text").length == 0) {
                            let hintHours = `<div class="hint-hours-text">
                                <div class="left"></div>
                                <div class="right"></div>
                            </div>`;

                            hint.append(hintHours);
                        }

                        let hintColor = hint.find(".order_cell").css("background-color");
                        let colorTextoContraste = ColorTextoBlancoNegro(rgb2hex(hintColor));
                        hint.find(".right").css("color", colorTextoContraste);

                        let anchoTiempoInicial = this.anchoPorDuracion(evento.duracionPreparacion);
                        let anchoWO = hint.find(".order_cell").outerWidth();

                        hint.find(".left").css("left", `calc(${anchoTiempoInicial}px + 0.8em)`);

                        // Cambiamos el color del texto para que siempre sea visible independientemente del color de fondo
                        hint.find(".left").css("color", colorTextoContraste);

                        //comprobamos si hay solapamiento para subir el texto izquierdo y que sean legibles
                        if (anchoWO < 64) {
                            hint.find(".left").css("bottom", "1.3em");
                        }

                        hint.find(".left").html(kendo.toString(fechaInicio, 'H:mm'));
                        hint.find(".right").html(kendo.toString(fechaFin, 'H:mm'));
                    }

                    kendo.ui.Scheduler.prototype.calcularOffsetsDuracionWO = function (idLinea, inicio, fin, reverso = false) {
                        let offsetControl = 0;

                        if (inicio.getTime() >= fin.getTime()) {
                            return 0;
                        }

                        let offsetTime = this.tiempoSinPlanificar(idLinea, inicio.addSecs(1), fin.addSecs(-1));
                        while (offsetTime != offsetControl) {
                            offsetControl = offsetTime;
                            
                            offsetTime = this.tiempoSinPlanificar(idLinea
                                , (reverso ? inicio.addMins(-offsetTime) : inicio).addSecs(1)
                                , (reverso ? fin : fin.addMins(offsetTime)).addSecs(-1));
                        }

                        return offsetTime;
                    }

                    /// funcion que calcula la fecha final de una WO, colocandola detrás de otras si es necesario, y teniendo en cuenta el tiempo no planificado
                    kendo.ui.Scheduler.prototype.calcularFinWO = function (wo, ultimaWO, WOprocesadas, inicioFijo) {                        
                        let d = {
                            datosTP: { ...wo.decodificarDatosPreparacion() },
                            offsetTP: 0,
                            offsetD: 0,
                            inicioTP: new Date(wo.start.getTime()),
                            inicioWO: new Date(wo.inicioWO.getTime()),
                            finWO: new Date(wo.end.getTime())
                        }

                        let inicioValido = false;

                        if (inicioFijo) {
                            d.datosTP = this.bbView.ObtenerTiempoPreparacionWO(wo.id, wo.autoAjuste, d.datosTP, wo.idLinea, d.inicioWO, wo.idProducto, this, ultimaWO);

                            // tiempo no planificado que cae en el tiempo de preparación (hacia atrás)
                            let prepData = this.inicioPreparacionWO(wo, d.inicioTP, d.inicioWO, d.datosTP.duracion);
                            d.offsetTP = prepData.offsetTP;

                            d.inicioTP = new Date(prepData.inicioTP.getTime());        
                        } else {
                            d.inicioTP = new Date(d.inicioWO.getTime());
                        }


                        while (!inicioValido) {
                            if (wo.autoAjuste) {
                                if (ultimaWO) {
                                    // Movemos la wo si empieza dentro de otra    
                                    if (wo.autoDate || WOprocesadas.find(f => f.start <= d.inicioTP && f.end >= d.inicioTP)) {
                                        inicioFijo = false;
                                        d.inicioTP = new Date(ultimaWO.end.getTime());

                                        // Comprobamos si queda suficiente espacio planificado, si no la movemos al siguiente turno
                                        let tp = this.turnoPlanificado(wo.idLinea, ultimaWO.end);
                                        let margenWO = this.bbView.opciones && this.bbView.opciones["MARGEN_FECHAS_WO"] ? this.bbView.opciones["MARGEN_FECHAS_WO"].valor : 1;
                                        if (tp && !this.turnoPlanificado(wo.idLinea, tp.fin.addMins(1)) && tp.fin.getTime() - ultimaWO.end.getTime() < margenWO * 1000) {
                                            let ts = this.siguienteTurnoPlanificado(wo.idLinea, tp.fin.addMins(1));
                                            if (ts) {
                                                d.inicioTP = new Date(ts.inicio.getTime());
                                            }
                                        }
                                        
                                        d.inicioWO = d.inicioTP.addSecs(1);
                                    }
                                }
                            }

                            // Movemos la WO si empieza en tiempo no planificado 
                            if (!this.turnoPlanificado(wo.idLinea, d.inicioTP.addSecs(1))) {

                                if (inicioFijo) {
                                    let prepData = this.inicioPreparacionWO(wo, d.inicioTP, d.inicioWO, d.datosTP.duracion);
                                    d.inicioTP = new Date(prepData.inicioTP.getTime());
                                    d.inicioWO = new Date(prepData.inicioWO.getTime());

                                    inicioFijo = false;
                                    continue;
                                }

                                let turnoSiguiente = this.siguienteTurnoPlanificado(wo.idLinea, d.inicioTP);
                                if (turnoSiguiente) {
                                    d.inicioTP = new Date(turnoSiguiente.inicio.getTime());
                                    d.inicioWO = d.inicioTP.addSecs();
                                    inicioFijo = false;
                                }                       
                            }

                            let startControl = new Date(d.inicioTP.getTime());

                            d.datosTP = this.bbView.ObtenerTiempoPreparacionWO(wo.id, wo.autoAjuste, d.datosTP, wo.idLinea, d.inicioWO, wo.idProducto, this, ultimaWO);
                            if (!inicioFijo) {
                                d.inicioWO = d.inicioTP.addMins(d.datosTP.duracion);
                            }
                            else {
                                let prepData = this.inicioPreparacionWO(wo, d.inicioTP, d.inicioWO, d.datosTP.duracion);
                                d.inicioTP = new Date(prepData.inicioTP.getTime());
                            }                            

                            if (d.inicioTP.getTime() == startControl.getTime()) {
                                inicioValido = true;
                            }
                        }
                        d.inicioWO = d.inicioTP.addMins(d.datosTP.duracion);

                        // Calculamos el offset de tiempo no planificado en la duración de arranque y de la wo   
                        d.offsetTP = this.calcularOffsetsDuracionWO(wo.idLinea, new Date(d.inicioTP.getTime()), d.inicioWO.addSecs(10));
                        d.inicioWO._addMins(d.offsetTP);
                        wo._calcularDuracion();
                        d.finWO = d.inicioWO.addMins(wo.duracion);

                        d.offsetD = this.calcularOffsetsDuracionWO(wo.idLinea, new Date(d.inicioWO.getTime()), new Date(d.finWO.getTime()));
                        d.finWO._addMins(d.offsetD);

                        // Controlamos que no se salga del ultimo turno de la semana actual, a menos que se haya cambiado de semana directamente
                        let ultimoTurno = this.ultimoTurnoSemana(wo.idLinea, this.view().options.date.getWeek());
                        if (wo.cambiaSemana || wo.inicioWOAnterior.getWeek() != this.view().options.date.getWeek()) {
                            ultimoTurno = this.ultimoTurno(wo.idLinea);
                        }
                        if (ultimoTurno && ultimoTurno.fin.getTime() < d.finWO.getTime()) {
                            d.finWO = new Date(ultimoTurno.fin.getTime());
                            d.inicioWO = d.finWO.addMins(-wo.duracion);
                            
                            d.offsetD = this.calcularOffsetsDuracionWO(wo.idLinea, d.inicioWO, d.finWO, true);
                            d.inicioWO._addMins(-d.offsetD);

                            d.datosTP = this.bbView.ObtenerTiempoPreparacionWO(wo.id, wo.autoAjuste, d.datosTP, wo.idLinea, d.inicioWO, wo.idProducto, this, ultimaWO);
                            d.inicioTP = d.inicioWO.addMins(-d.datosTP.duracion);

                            d.offsetTP = this.calcularOffsetsDuracionWO(wo.idLinea, d.inicioTP, d.inicioWO, true);
                            d.inicioTP._addMins(-d.offsetTP);
                        }

                        return d;
                    }

                    // Devuelve el inicio de la preparación de la WO, extendiendola por tiempo no planificado y controlando que no se salga del primer turno
                    kendo.ui.Scheduler.prototype.inicioPreparacionWO = function (wo, inicio, inicioWO, duracionP) {
                        
                        let res = {
                            inicioTP: new Date(inicio.getTime()),
                            inicioWO: new Date(inicioWO.getTime()),
                            offsetTP: 0
                        }

                        let turnoSiguienteWO = this.turnoPlanificado(wo.idLinea, inicioWO.addSecs(1)) || this.siguienteTurnoPlanificado(wo.idLinea, inicioWO.addSecs(1));
                        let inicioWOTurno = turnoSiguienteWO ?
                            !this.turnoPlanificado(wo.idLinea, inicioWO.addSecs(1)) ? new Date(turnoSiguienteWO.inicio.getTime()) : new Date(inicioWO.getTime())
                            : null;

                        if (inicioWOTurno) {
                            res.offsetTP = this.calcularOffsetsDuracionWO(wo.idLinea, inicioWOTurno.addMins(-duracionP), inicioWOTurno, true);
                            if (res.offsetTP == 0) {
                                res.inicioTP = inicioWOTurno.addMins(-duracionP);
                                res.inicioWO = inicioWOTurno.addSecs();
                            }
                            else {
                                // Comprobamos si podemos usar el turno anterior, y que este no se pase de semana
                                if (inicioWOTurno.addMins(-(duracionP + res.offsetTP)).getWeek() == inicioWOTurno.getWeek()) {
                                    // Puede moverse a la posicion anterior
                                    res.inicioTP = inicioWOTurno.addMins(-(duracionP + res.offsetTP));
                                    res.inicioWO = inicioWOTurno.addSecs();
                                } else {
                                    //se pasa de semana 
                                    // Comprobamos si hay que ponerla al principio de la semana o al final
                                    let ultimoTurnoSem = this.ultimoTurnoSemana(wo.idLinea, res.inicioWO.getWeek());
                                    if (ultimoTurnoSem && ultimoTurnoSem.fin.getTime() <= res.inicioWO.getTime()) {
                                        // Lo colocamos al final de la semana
                                        res.inicioWO = ultimoTurnoSem.fin.addMins(-wo.duracion);
                                        res.inicioTP = res.inicioWO.addMins(-duracionP);
                                    } else {
                                        //se coloca en el primer turno de la semana, o a las 00 del turno de noche
                                        res.inicioTP = res.inicioWO.getMonday().midnight();
                                        let primerTurnoSem = this.siguienteTurnoPlanificado(wo.idLinea, res.inicioTP.addSecs(1));
                                        if (!this.turnoPlanificado(wo.idLinea, res.inicioTP) && primerTurnoSem) {
                                            res.inicioTP = new Date(primerTurnoSem.inicio.getTime());
                                        }
                                        res.inicioWO = res.inicioTP.addMins(duracionP + res.offsetTP)
                                    }                                    
                                }
                            }
                        }

                        return res;
                    }

                    // función que reoordena las WO del datasource para encajarlas una detrás de otra, teniendo en cuenta los turnos no planificados
                    // El parametro modoIndiv sirve para ordenar unicamente la wo movida, sin mover las que tuviera pegadas tras ella
                    kendo.ui.Scheduler.prototype.ordenarWO = function (idLineas, lastWOmodified, removedWO) {
                        let idLinea;
                        let bbView = this.bbView;
                        let fechaSCH = this.view().options.date;
                        let semanaSCH = fechaSCH.getWeek();
                        let margenWO = bbView.opciones && bbView.opciones["MARGEN_FECHAS_WO"] ? bbView.opciones["MARGEN_FECHAS_WO"].valor : 1;
                        let modoIndiv = this.ctrlKeyPressed;

                        try {
                            // CargaInicial
                            if (!this.cargaInicial) {
                                //Comprobamos las WOs que tengan datos extraños para desactivar su autoajuste
                                let orders = Array.from(this.dataSource.data()).sort((a, b) => a.idLinea - b.idLinea);
                                for (let wo of orders) {

                                    // calculamos la fecha de inicio con la preparación
                                    let prepData = this.inicioPreparacionWO(wo, wo.start, wo.inicioWO, wo.duracionPreparacion);
                                    wo.start = new Date(prepData.inicioTP.getTime());
                                    wo.startAnterior = new Date(wo.start.getTime());
                                }
                            }

                            // En el caso de que la WO modificada haya cambiado de línea, borramos la lista de arranques para que se recargue y reoordenamos ambas líneas
                            if (lastWOmodified && lastWOmodified.idLinea != lastWOmodified.idLineaAnterior) {
                                lastWOmodified.tiemposArranque = null;
                                if (!idLineas.includes(lastWOmodified.idLineaAnterior)) {
                                    idLineas.push(lastWOmodified.idLineaAnterior);
                                }
                            }
                            // Recorremos las líneas que necesiten ordenación
                            for (let l of idLineas) {
                                idLinea = l;
                                let orders = this.dataSource.data().filter(f => f.idLinea == idLinea);
                                if (!orders.length) {
                                    continue;
                                }
                                let WOactual = lastWOmodified && lastWOmodified.idLinea == idLinea ?
                                    {
                                        id: lastWOmodified.id,
                                        start: new Date(lastWOmodified.start.getTime()),
                                        startAnterior: new Date(lastWOmodified.startAnterior.getTime()),
                                        inicioWO: new Date(lastWOmodified.inicioWO.getTime()),
                                        inicioWOAnterior: new Date(lastWOmodified.inicioWOAnterior.getTime()),
                                        end: new Date(lastWOmodified.end.getTime()),
                                        endAnterior: new Date(lastWOmodified.endAnterior.getTime()),
                                        idLinea: idLinea
                                    } : null;
                                let WOborrada = removedWO ?
                                    {
                                        id: removedWO.id,
                                        start: new Date(removedWO.start.getTime()),
                                        startAnterior: new Date(removedWO.startAnterior.getTime()),
                                        inicioWO: new Date(removedWO.inicioWO.getTime()),
                                        inicioWOAnterior: new Date(removedWO.inicioWOAnterior.getTime()),
                                        end: new Date(removedWO.end.getTime()),
                                        endAnterior: new Date(removedWO.endAnterior.getTime()),
                                        idLinea: idLinea
                                    } : (lastWOmodified && lastWOmodified.idLineaAnterior == idLinea && lastWOmodified.idLinea != lastWOmodified.idLineaAnterior ?
                                        {
                                            id: lastWOmodified.id,
                                            start: new Date(lastWOmodified.start.getTime()),
                                            startAnterior: new Date(lastWOmodified.startAnterior.getTime()),
                                            inicioWO: new Date(lastWOmodified.inicioWO.getTime()),
                                            inicioWOAnterior: new Date(lastWOmodified.inicioWOAnterior.getTime()),
                                            end: new Date(lastWOmodified.end.getTime()),
                                            endAnterior: new Date(lastWOmodified.endAnterior.getTime()),
                                            idLinea: idLinea
                                        } : null);

                                // Ordenamos las WO de la línea dentro de la lista
                                if (WOactual || WOborrada) {
                                    let wo = WOborrada;
                                    if (WOactual) {
                                        wo = orders.find(f => f.id == WOactual.id);
                                    }
                                    
                                    if (wo) {
                                        if (WOactual && wo.nueva) {
                                            // La colocamos justo después de la última si existen más en la semana que estamos viendo, o al principio de esa semana
                                            let ultimaWO = orders.filter(f => f.id != wo.id && f.end.getWeek() == semanaSCH).sort((a, b) => b.inicioWO - a.inicioWO);
                                            if (ultimaWO.length > 0) {
                                                wo.start = ultimaWO[0].endAnterior.addSecs(0);                                                
                                                wo.autoDate = true;
                                            } else {
                                                wo.start = fechaSCH.getMonday().midnight();
                                                wo.autoDate = false;
                                            }
                                            wo.inicioWO = wo.start.addSecs(0);
                                            wo.inicioFijo = false;
                                        }
                                        else {
                                            let i = 1;

                                            if (modoIndiv || !wo.autoAjuste) {
                                                let woAnteriores = orders.filter(f => f.id != wo.id
                                                    && f.inicioWOAnterior.addMins((f.duracion + f.duracionOffset) / 3).getTime() <= wo.inicioWO.getTime())
                                                    .sort((a, b) => a.startAnterior - b.startAnterior);
                                                woAnteriores.map(m => { m.ordenGantt = i++; m.autoDate = false; });

                                                if (WOactual) {
                                                    // Orden de la wo actual
                                                    wo.ordenGantt = i++;
                                                }

                                                // Orden de las wo posteriores
                                                orders.filter(f => f.id != wo.id && woAnteriores.find(f2 => f2.id == f.id) == null)
                                                    .sort((a, b) => a.startAnterior - b.startAnterior)
                                                    .map(m => m.ordenGantt = i++);
                                            } else {
                                                // Pueden existir 2 grupos de wo, las que están pegadas a la que se mueve antes de moverse, y las que están pegadas donde se mueve                                            
                                                // WOs que estaban pegadas a la wo antes de moverse por detrás
                                                let wos1 = [];
                                                // WOS que estan pegadas donde se mueve la wo
                                                let wos2 = [];

                                                let wos = orders.filter(f => f.id != wo.id);
                                                wos2 = wos.filter(f => f.startAnterior.getTime() <= wo.inicioWO.getTime() && f.endAnterior.getTime() >= wo.inicioWO.getTime());
                                                if (wos2.length) {
                                                    wos2.length = 1;
                                                }
                                                for (let h = 0; h < 2; h++) {
                                                    // con h = 0 obtenemos las wo pegadas a la actual por detrás antes de moverse
                                                    // con h = 1 obtenemos las wo pegadas entre ellas donde se ha movido la actual
                                                    let g1 = h == 0;

                                                    for (let j = 0; j < 2; j++) {
                                                        if (g1 && j > 0) {
                                                            continue;
                                                        }
                                                        let haciaAtras = j == 0;

                                                        let woAux = {
                                                            id: wo.id,
                                                            start: g1 ? wo.startAnterior.addSecs() : wo.inicioWO.addSecs(),
                                                            end: g1 ? wo.endAnterior.addSecs() : wo.end.addSecs(),
                                                            idLinea: wo.idLinea
                                                        }

                                                        if (!g1) {
                                                            if (!wos2.length) {
                                                                continue;
                                                            }
                                                            woAux = {
                                                                id: wos2[0].id,
                                                                start: wos2[0].startAnterior.addSecs(),
                                                                end: wos2[0].endAnterior.addSecs(),
                                                                idLinea: wos2[0].idLinea
                                                            }
                                                        }
                                                        
                                                        while (woAux) {
                                                            let woCons = comprobarWOConsecutivas(woAux, wos, haciaAtras, this)
                                                            if (woCons) {
                                                                if (g1) {
                                                                    wos1.push(woCons);
                                                                } else {
                                                                    wos2.push(woCons);
                                                                }

                                                                woAux = {
                                                                    id: woCons.id,
                                                                    start: g1 ? woCons.startAnterior.addSecs() : woCons.inicioWO.addSecs(),
                                                                    end: g1 ? woCons.endAnterior.addSecs() : woCons.end.addSecs(),
                                                                    idLinea: woCons.idLinea
                                                                }
                                                            } else {
                                                                woAux = null;
                                                            }
                                                        }
                                                    }

                                                    // Eliminamos del listado las que ya esten pegadas a la wo, para que no se incluyan en el grupo 2
                                                    wos = wos.filter(f => wos1.find(f2 => f2.id == f.id) == null);
                                                }

                                                // Ordenamos todas las WO previas a la que se ha movido
                                                orders.filter(f => f.id != wo.id
                                                    && wos1.find(f2 => f2.id == f.id) == null
                                                    && wos2.find(f2 => f2.id == f.id) == null
                                                    && f.inicioWOAnterior.addMins((f.duracion + f.duracionOffset) / 3).getTime() <= wo.inicioWO.getTime())
                                                    .sort((a, b) => a.startAnterior - b.startAnterior)
                                                    .map(m => m.ordenGantt = i++);

                                                // Ordenamos las wos del grupo donde se mueve la wo y que vayan antes de la nueva
                                                wos2.filter(f => f.inicioWOAnterior.addMins((f.duracion + f.duracionOffset) / 3).getTime() <= wo.inicioWO.getTime())
                                                    .sort((a, b) => a.startAnterior - b.startAnterior)
                                                    .map(m => m.ordenGantt = i++);

                                                if (WOactual) {
                                                    // Orden de la wo actual
                                                    wo.ordenGantt = i++;
                                                }

                                                // Ordenamos las wos que estaban pegadas a la que se mueve
                                                wos1.sort((a, b) => a.startAnterior - b.startAnterior)
                                                    .map(m => { m.ordenGantt = i++; m.autoDate = true });

                                                // La WO que vaya justo después de la borrada, la movemos a la posición anterior de esta
                                                if (WOborrada) {
                                                    let woTrasBorrar1 = wos1.sort((a, b) => a.ordenGantt - b.ordenGantt)[0];
                                                    if (woTrasBorrar1) {
                                                        woTrasBorrar1.inicioWOAnterior = new Date(WOborrada.inicioWO.getTime())
                                                    }
                                                }

                                                // ordenamos las wos del grupo donde se mueve la nueva, y detrás de esta
                                                wos2.filter(f => f.ordenGantt == 0)
                                                    .sort((a, b) => a.startAnterior - b.startAnterior)
                                                    .map(m => { m.ordenGantt = i++; m.autoDate = true });

                                                // ordenamos el resto de wos
                                                orders.filter(f => f.ordenGantt == 0)
                                                    .sort((a, b) => a.startAnterior - b.startAnterior)
                                                    .map(m => m.ordenGantt = i++);
                                            }
                                        }
                                    }
                                } 

                                orders.sort((a, b) => a.ordenGantt ? a.ordenGantt - b.ordenGantt : a.inicioWO - b.inicioWO);

                                let lastOrder = null;                                
                                let sorted = [];
                                for (let wo of orders) {
                                    if (wo.esEditable) {
                                        let inicioFijo = !this.cargaInicial ? true :
                                            modoIndiv && WOactual && wo.id == WOactual.id ? false : wo.inicioFijo;

                                        let datosWO = this.calcularFinWO(wo, lastOrder, sorted, inicioFijo);

                                        wo.codificarDatosPreparacion(datosWO.datosTP);
                                        wo.duracionPreparacionOffset = datosWO.offsetTP;
                                        wo.duracionOffset = datosWO.offsetD;
                                        wo.start = datosWO.inicioTP;
                                        wo.inicioWO = datosWO.inicioWO;
                                        wo.end = datosWO.finWO;
                                    }

                                    if (wo.autoAjuste) {
                                        lastOrder = wo;
                                        sorted.push(wo);
                                    }                                    

                                    wo.idLineaAnterior = wo.idLinea;
                                    wo.startAnterior = new Date(wo.start.getTime());
                                    wo.inicioWOAnterior = new Date(wo.inicioWO.getTime());
                                    wo.duracionPreparaccionAnterior = wo.duracionPreparacion;
                                    wo.endAnterior = new Date(wo.end.getTime());
                                    wo.ordenGantt = 0;
                                    wo.nueva = false;
                                    wo.autoDate = false;
                                    wo.inicioFijo = true;
                                    wo.cambiaSemana = false;
                                    if (WOactual && wo.id == WOactual.id) {
                                        wo.revisar = false;
                                    }
                                }
                            }

                            if (!this.cargaInicial) {
                                // Las WO que no sean iguales que antes de procesarse han cambiado por algo, puede ser por cambios en los turnos, 
                                // o por cambios en alguno de los parámetros de MES involucrados. Tendremos que avisar al usuario que la planificación ha cambiado automáticamente 
                                // y la tiene que revisar y guardar
                                this.dataSource.data().map(m => { m.revisar = m.modificado() });

                                if (this.dataSource.data().find(f => f.revisar)) {
                                    OpenWindow(window.app.idioma.t("ATENCION"),
                                        window.app.idioma.t("PLANIFICADOR_AVISO_CAMBIOS_WO"))
                                }
                            }

                            this.refresh();         

                            function comprobarWOConsecutivas(wo, wos, haciaAtras, sch) {

                                let WOconsecutiva = wos.find(f => f.id != wo.id
                                    && f.esEditable
                                    && (haciaAtras ?
                                        f.startAnterior.closeTo(wo.end, margenWO) :
                                        f.endAnterior.closeTo(wo.start, margenWO))
                                );
                                if (!WOconsecutiva) {
                                    // Si la wo consecutiva termina/empieza justo al inicio/fin (o dentro) de tiempo no planificado, comprobamos la fecha de inicio/fin del siguiente turno, y si son de la misma semana
                                    if (haciaAtras ?
                                        !sch.turnoPlanificado(wo.idLinea, wo.end.addSecs(margenWO+1)) :
                                        !sch.turnoPlanificado(wo.idLinea, wo.start.addSecs(-(margenWO+1)))
                                    ) {
                                        let turnoConsecutivo = haciaAtras ?
                                            sch.siguienteTurnoPlanificado(wo.idLinea, wo.end.addSecs(1)) :
                                            sch.anteriorTurnoPlanificado(wo.idLinea, wo.start.addSecs(-1));
                                        if (turnoConsecutivo) {
                                            WOconsecutiva = wos.find(f => f.id != wo.id
                                                && f.esEditable
                                                && (haciaAtras ?
                                                f.startAnterior.getWeek() == wo.end.getWeek() && f.startAnterior.closeTo(turnoConsecutivo.inicio, margenWO) :
                                                f.endAnterior.getWeek() == wo.start.getWeek() && f.endAnterior.closeTo(turnoConsecutivo.fin, margenWO)
                                                ));
                                        }
                                    }
                                }

                                return WOconsecutiva;
                            }

                        } catch (er) {
                            console.log("Error ordenando las WO en la linea " + idLinea);
                            console.log(er)
                            console.log(lastWOmodified);
                            console.log(removedWO);
                        }
                        this.ctrlKeyPressed = null;
                        this.fromEditor = false;
                    }
                }

                let today = new Date();
                let min = today.addDays(self.opciones['OFFSET_VISION_INICIO'].valor);
                let max = today.addDays(self.opciones['OFFSET_VISION_FIN'].valor);

                if (self.sch) {
                    try {
                        self.sch._moveDraggable.unbind("drag");
                        $("#OrdersScheduler").getKendoScheduler().destroy();
                    } catch {}
                    $("#OrdersScheduler").empty();
                    self.sch = null;
                }
                $("#window-editar").remove();

                self.sch = $("#OrdersScheduler").kendoScheduler({
                    date: today.addDays(7).getMonday(),
                    startTime: new Date("2000/01/01 00:00:00"),
                    min: min,
                    max: max,
                    eventHeight: 50,
                    views: [
                        {
                            type: "timeline",
                            // Editar los parámetros de ticks requiere cambiar la variable tiempoCelda en el template del html
                            majorTick: 30,
                            minorTickCount: 1,
                            columnWidth: 40,
                            selectedDateFormat: "{0:dd-MM-yyyy}",
                            majorTimeHeaderTemplate: kendo.template(
                                "<strong style='font-size: 1em;'>#=kendo.toString(date, 'H:mm')#</strong>"),
                            slotTemplate: kendo.template($("#slotTemplateDay").html())
                        },
                        {
                            type: "timelineWeek",
                            // Editar los parámetros de ticks requiere cambiar la variable tiempoCelda en el template del html
                            majorTick: 360,
                            minorTickCount: 1,
                            columnWidth: 20,
                            majorTimeHeaderTemplate: kendo.template(
                                "<strong>#=kendo.toString(date, 'HH')#</strong>"),
                            slotTemplate: kendo.template($("#slotTemplateWeek").html())
                        },
                        {
                            type: "timelineMonth",
                            // Editar los parámetros de ticks requiere cambiar la variable tiempoCelda en el template del html
                            majorTick: 720,
                            minorTickCount: 1,
                            columnWidth: 40,
                            slotTemplate: kendo.template($("#slotTemplateMonth").html())
                        }],
                    messages: {
                        today: window.app.idioma.t("HOY"),
                        views: {
                            timeline: window.app.idioma.t("DIA"),
                            timelineWeek: window.app.idioma.t("SEMANA"),
                            timelineMonth: window.app.idioma.t("MES")
                        }
                    },
                    timezone: "Etc/UTC",
                    eventTemplate: $("#orderTemplate").html(),
                    group: {
                        resources: ["Lineas"],
                        orientation: "vertical"
                    },
                    workDayStart: new Date("2000/1/1 00:00:00"),
                    workDayEnd: new Date("2000/1/1 23:59:59"),
                    workDays: [1, 2, 3, 4, 5, 6, 7],
                    footer: false,
                    groupHeaderTemplate: function (e) {
                        const linea = self.datosMES.lineas.find(f => f.idLinea == e.value);

                        return `<div class='lineasHeader'>
                            <span>${e.text}</span>
                            <span class="datosOEE" style='font-weight: 200;'>${ window.app.idioma.t('OEE_OBJETIVO')}: ${(linea?.oeeObjetivo?.toFixed(2) || 0.00)} %</span>
                            <span class="datosOEE" style='padding: 4px;font-weight: 200;'>${ window.app.idioma.t('OEE_MAX_ALCANZABLE')}:<span class='oeePlan' data_id='${e.value}' style="padding: 4px;">0</span>%</span>
                            </div>`                        
                    },
                    resources: [
                        {
                            field: "idLinea",
                            name: "Lineas",
                            dataSource: self.datosMES.lineas,
                            title: "Linea"
                        },
                    ],
                    dataSource: new kendo.data.SchedulerDataSource({
                        data: [],
                        schema: self.WOSchema
                    }),
                    editable: {
                        confirmation: false,
                        update: false,
                        create: false
                    },
                    dataBound: function (e) {
                        // Creamos el drop area para poder soltar ordenes
                        let sch = e.sender;

                        self.ConfigurarDropAreaScheduler(sch);

                        //Configuramos los doble click para editar un evento
                        $(".k-scheduler-content").dblclick((e) => {
                            if ($("#window-editar").length != 0) {
                                return;
                            }
                            let evento = $(e.target);
                            if (evento.length) {
                                let wo = sch.dataSource.getByUid(evento.data("uid"));
                                if (wo && wo.esEditable) {
                                    self.schedulerTooltip.activo = false;
                                    self.schedulerTooltip.hide();
                                    self.ModalEditar(wo);
                                }
                            }
                        })

                        // Añadimos elemento para mostrar la semana
                        let fechaSch = $(".k-lg-date-format");
                        if (fechaSch.length) {
                            let txt = $(".k-lg-date-format").html();
                            let idx = txt.indexOf(" - "+window.app.idioma.t("SEMANA"));
                            if (idx != -1) {
                                txt = txt.slice(0, idx);
                            }
                            if (sch.viewName() != 'timelineMonth') {
                                fechaSch.html(txt +" - "+ window.app.idioma.t("SEMANA") + " " + sch.date().getWeek());
                            } else {
                                fechaSch.html(txt);
                            }
                        }

                        // Calculo OEEPlanificado
                        self.ActualizarOEEPlanificado(sch);

                        if (sch.turnosPlanificados) {
                            return;
                        }

                        sch.turnosPlanificados = turnosPlanificados;
                        sch.ultimasProducciones = ultimasProducciones;

                        if (WOSecuenciadasMES.length > 0) {
                            // añadimos aquí el datasource porque asignandolo directamente al crear el scheduler cambian las fechas
                            let schDS = new kendo.data.SchedulerDataSource({
                                data: WOSecuenciadasMES,
                                schema: self.WOSchema
                            })                                
                            sch.setDataSource(schDS);
                            sch.ordenarWO(self.datosMES.lineas.map(o => o.idLinea));                            
                        }
                        sch.cargaInicial = true;

                        //Cargamos la vista inicial configurada en las opciones
                        let vista = sch.viewName();
                        if (self.constTipoVista && self.opciones && self.opciones["VISTA_INICIAL"]) {
                            for (let a in self.constTipoVista) {
                                let b = self.constTipoVista[a];
                                if (b.key == self.opciones["VISTA_INICIAL"].valor) {
                                    vista = b.value;
                                }
                            }
                        }

                        //configuramos el SNAP
                        if (self.opciones && self.opciones["SNAP_HORAS"]) {
                            sch.options.snap = self.opciones["SNAP_HORAS"].valor;
                        }

                        sch.view(vista);

                        // Capturamos el evento drag del dragable asociado al scheduler
                        setTimeout(() => {
                            let draggable = e.sender._moveDraggable;
                            if (draggable) {                                
                                draggable.bind("drag", function (a) {
                                    let hint = $(".k-event-drag-hint");
                                    let dataItem = sch.dataSource.getByUid(hint.data("uid"));

                                    if (!hint || !dataItem) {
                                        return;
                                    }

                                    // capturamos si hemos pulsado ctrl al arrastrar, para hacerlo en modo individual
                                    if (sch.ctrlKeyPressed == null) {
                                        sch.ctrlKeyPressed = a.ctrlKey;
                                    }

                                    let offset = a.x.location - a.x.startLocation;
                                    let tiempoSlot = sch.tiempoCelda();
                                    let anchoSlot = sch.anchoCelda();

                                    let slotInicial = sch.slotByPosition(a.x.startLocation, a.y.startLocation);
                                    // Fecha del click inicial al empezar a arrastrar
                                    let fechaInicial = new Date(dataItem.inicioWO);
                                    if (!slotInicial) {
                                        return;
                                    }
                                    let slotElem = $(slotInicial.element);
                                    let slotInicialOffsetInterno = a.x.startLocation - slotElem.offset().left;
                                    fechaInicial = new Date(slotInicial.startDate); 
                                    fechaInicial._addMins(slotInicialOffsetInterno * tiempoSlot / anchoSlot);

                                    // Posicion X del inicio de la WO en el hint (sin contar tiempo inicial)
                                    let xHintInicial = a.x.startLocation - sch.anchoPorDuracion((fechaInicial.getTime() - dataItem.inicioWO.getTime()) / 60000);

                                    // Fecha de inicio de la WO (sin contar tiempo inicial)
                                    let fechaInicio = fechaInicial.addMins(-((fechaInicial.getTime() - dataItem.inicioWO.getTime()) / 60000));

                                    // añadimos a la fecha lo que hayamos arrastrado
                                    fechaInicio._addMins(offset * tiempoSlot / anchoSlot);

                                    let xActual = xHintInicial + offset;

                                    if (sch.options.snap) {
                                        // Slot donde empieza la WO
                                        let slotHintInicial = Math.round((slotElem.offset().left - xHintInicial) / anchoSlot);

                                        let movimientoFueraSlot = offset >= 0 ? Math.max(offset - (anchoSlot - slotInicialOffsetInterno), 0) : Math.max(Math.abs(offset) - slotInicialOffsetInterno, 0)
                                        let slotsMovidos = Math.ceil(movimientoFueraSlot / anchoSlot);

                                        // Posición ajustada a la celda
                                        xActual = (slotElem.offset().left - slotHintInicial * anchoSlot) + (((slotsMovidos) * anchoSlot) * Math.sign(offset));

                                        // fecha ajustada a la hora
                                        fechaInicio = slotInicial.startDate.addMins(tiempoSlot * -slotHintInicial);
                                        fechaInicio._addMins(slotsMovidos * tiempoSlot * Math.sign(offset));
                                    }

                                    //let nuevoTiempoInicio = self.ObtenerTiempoInicialWO(dataItem.id, dataItem.arranqueUsuario ? dataItem.idArranque : 0, dataItem.idLinea, fechaInicio, dataItem.idProducto, sch);
                                    let datosTP = self.ObtenerTiempoPreparacionWO(dataItem.id, dataItem.autoAjuste, dataItem.decodificarDatosPreparacion(), dataItem.idLinea, fechaInicio, dataItem.idProducto, sch);

                                    dataItem.codificarDatosPreparacion(datosTP);

                                    // Restamos a la posicion X actual el ancho del nuevo tiempoInicial
                                    hint.offset({
                                        left: xActual - sch.anchoPorDuracion(dataItem.duracionPreparacion)
                                    });

                                    let fechaFin = fechaInicio.addMins(dataItem.duracion);

                                    // Bloqueamos el movimiento horizontal si intentamos colocarla en el tiempo no planificado final
                                    let ultimoTurno = sch.ultimoTurno(dataItem.idLinea);
                                    if (ultimoTurno && ultimoTurno.fin.getTime() < fechaFin.getTime()) {
                                        hint.offset({
                                            left: sch.posicionFinalPlanificada(dataItem.idLinea) - sch.anchoPorDuracion(dataItem.duracion + dataItem.duracionPreparacion)
                                        })
                                        fechaFin = new Date(ultimoTurno.fin);
                                        fechaInicio = fechaFin.addMins(-dataItem.duracion);
                                    }

                                    // Gestionamos los cambios de línea posibles de la WO
                                    let slotMuestraLinea = sch.view().content.find("tr[role='row'] td:first-child").filter((idx, f) => $(f).offset().top == hint.offset().top);
                                    let lineaSlot = slotMuestraLinea.length > 0 ? slotMuestraLinea.find(".sub_slot").data("id_linea") : "";
                                    if (!Array.from(dataItem.orden.idLineas).includes(lineaSlot)) {
                                        let slotCorrecto = sch.view().content.find(".sub_slot[data-id_linea='" + dataItem.idLinea + "']:first").parent();
                                        if (slotCorrecto.length > 0) {
                                            hint.offset({ top: slotCorrecto.offset().top })
                                        }
                                    }
                                    else {
                                        dataItem.idLinea = lineaSlot;
                                    }

                                    // Actualizamos el hint según la duración del evento
                                    sch.configuracionHintWO(hint, dataItem);
                                    sch.mostrarHorasHint(hint, fechaInicio, dataItem);

                                    sch.fechasFinales = { inicio: fechaInicio, fin: fechaFin };

                                    a.preventDefault();
                                });
                            }
                        })
                    },
                    remove: function (e) {
                        self.schedulerTooltip.hide();

                        let sch = e.sender;

                        e.preventDefault();

                        self.EliminarEventoSch(e.event);
                    },
                    moveStart: function (e) {
                        if (!e.event.esEditable) {
                            e.preventDefault();
                            return;
                        }
                        self.schedulerTooltip.activo = false;
                        self.schedulerTooltip.hide();
                    },
                    move: function (e) {
                        let sch = e.sender;

                        let hint = $(".k-event-drag-hint");
                        if (hint.length > 0) {
                            sch.lastSlot = sch.slotByElement(hint);
                        }
                    },
                    moveEnd: function (e) {
                        let sch = e.sender;

                        if (!e.event) {
                            return;
                        }

                        e.event.inicioWO = new Date(sch.fechasFinales.inicio);

                        if (Array.from(e.event.orden.idLineas).includes(e.resources.idLinea)) {
                            e.event.idLinea = e.resources.idLinea;
                        }

                        if (e.event.inicioWOAnterior.getWeek() != e.event.inicioWO.getWeek()) {
                            e.event.cambiaSemana = true;
                        }

                        e.preventDefault();

                        sch.ordenarWO([e.event.idLinea], e.event);
                        self.schedulerTooltip.activo = true;
                    },
                    resizeStart: function (e) {
                        let sch = e.sender;
                        if (!e.event.esEditable) {
                            e.preventDefault();
                            return;
                        }

                        self.schedulerTooltip.activo = false;
                        self.schedulerTooltip.hide();
                        sch.resizeFrame = 0;
                    },
                    resize: function (e) {
                        let sch = e.sender;

                        if (sch.resizeFrame == 0) {
                            sch.resizeFrame++;
                            return;
                        }
                        sch.resizeFrame++;

                        if (!sch.resizeDesdeInicioWO) {
                            e.start = new Date(e.event.inicioWO.getTime());
                        }

                        let valido = true;

                        if (sch.resizeDesdeInicioWO && !sch.turnoPlanificado(e.event.idLinea, e.start.addSecs(1))) {
                            // Estamos moviendo el inicio en tiempo no planificado
                            let turnoSig = sch.siguienteTurnoPlanificado(e.event.idLinea, e.start.addSecs(1));
                            if (turnoSig) {
                                e.start = new Date(turnoSig.inicio.getTime());
                            } else {
                                e.start = new Date(e.event.inicioWO.getTime());
                            }
                        }

                        if (!sch.resizeDesdeInicioWO && !sch.turnoPlanificado(e.event.idLinea, e.end.addSecs(-1))) {
                            // estamos moviendo el final en tiempo no planificado
                            let turnoAnt = sch.anteriorTurnoPlanificado(e.event.idLinea, e.end.addSecs(-1));
                            if (turnoAnt) {
                                e.end = new Date(turnoAnt.fin.getTime());
                            } else {
                                e.end = new Date(e.event.end.getTime());
                            }
                        }

                        let cantidad = e.event._nuevaCantidad(sch, e.start, e.end);
                        if (cantidad <= 0) {
                            valido = false
                        }
                        else {
                            $("#WO_" + e.event.id).find(".cantidad").html(cantidad);
                        }

                        if (valido) {
                            let primerSlot = sch.primerSlot(e.event.idLinea);
                            if (primerSlot) {
                                let tiempoPrimerSlot = new Date(primerSlot.find(".sub_slot").data("fecha_inicio"));
                                let minsDesdePrimerSlot = (e.start.getTime() - tiempoPrimerSlot.getTime()) / 60000;
                                let minsDuracion = (e.end.getTime() - e.start.getTime()) / 60000;

                                let posX = primerSlot.offset().left + sch.anchoPorDuracion(minsDesdePrimerSlot);
                                let ancho = sch.anchoPorDuracion(minsDuracion);
                                let elemento = this.wrapper.find(".k-scheduler-marquee");
                                if (elemento.length > 0) {
                                    elemento.offset({ left: posX });
                                    elemento.css("width", ancho + "px");
                                    elemento.find(".k-label-top").html(kendo.toString(e.start, 'H:mm'));
                                    elemento.find(".k-label-bottom").html(kendo.toString(e.end, 'H:mm'));

                                }
                            }
                            
                            sch.fechasFinales = { inicio: e.start, fin: e.end };
                        }

                        e.preventDefault();

                    },
                    resizeEnd: function (e) {
                        let sch = e.sender;

                        // si alguna de las fechas acaba en tiempo no planificado no actualizamos datos
                        if ((sch.resizeDesdeInicioWO && !sch.turnoPlanificado(e.event.idLinea, sch.fechasFinales.inicio.addSecs(1)))
                            || (!sch.resizeDesdeInicioWO && !sch.turnoPlanificado(e.event.idLinea, sch.fechasFinales.fin.addSecs(-1)))) {
                            e.preventDefault();
                            return;
                        }

                        e.event._recalcularCantidad(sch, sch.fechasFinales.inicio.addMins(e.event.duracionPreparacion), new Date(sch.fechasFinales.fin));
                        e.event._recalcularCantidad(sch, sch.fechasFinales.inicio, new Date(sch.fechasFinales.fin));

                        e.preventDefault();

                        sch.ordenarWO([e.event.idLinea], e.event);

                        self.schedulerTooltip.activo = true;
                    }
                }).getKendoScheduler();

                if ($("#OrdersScheduler").getKendoTooltip()) {
                    $("#OrdersScheduler").getKendoTooltip().destroy();
                    self.schedulerTooltip = null;
                }

                self.schedulerTooltip = $("#OrdersScheduler").kendoTooltip({
                    filter: ".k-event:not(.k-event-drag-hint,.changeTimeCell,.bootTimeCell)",
                    position: "top",
                    width: "",
                    content: kendo.template($('#orderTooltipTemplate').html()),
                    show: function (e) {
                        if (!this.activo) {
                            this.content.parent().css("visibility", "hidden");
                        } else {
                            this.content.parent().css("visibility", "visible");
                        }
                    }
                }).getKendoTooltip();

                self.schedulerTooltip.activo = true;
            },
            ActualizarOEEPlanificado: function (sch) {
                const self = this;

                if (sch.viewName() != "timelineWeek") {
                    $(".datosOEE").css("opacity", 0);
                    return;
                }
                $(".datosOEE").css("opacity", 1);

                let data = Array.from(sch.dataSource.data());

                const view = sch.view();

                const startDate = view.startDate();
                const endDate = view.endDate().addDays(1);

                for (let l of self.datosMES.lineas) {

                    // turnos que pertenecen a la semana (empezando por el de mañana del lunes hasta el de noche del domingo)
                    let turnos = sch.turnosPlanificados.filter(f => f.idLinea == l.idLinea && f.inicio >= startDate && f.inicio < endDate);
                     
                    const envPlan = data.reduce((ac, el) => {
                        if (el.idLinea != l.idLinea) {
                            return ac + 0;
                        }
                        // Obtenemos la cantidad proporcional en el tiempo planificado de la semana
                        const prop = DuracionProporcional(el.inicioWO, el.end, el.duracion, turnos);
                        return ac + (el.cantidad * prop * el.relacionesEnvases.envasesPalet);
                    }, 0);

                    // Envases Teóricos
                    const tiempoPlanificado = turnos.reduce((ac, el) => {
                        const time = Math.ceil((el.fin - el.inicio) / (1000 * 60 * 60));

                        return ac + time;
                    }, 0);
                    const paramLinea = self.datosMES.parametrosLinea.datos.filter(f => f.idLinea == l.idLinea)
                        .reduce((ac, el) => el.velocidadNominal > ac.velocidadNominal ? el : ac);                    

                    const envTeo = tiempoPlanificado * (paramLinea?.velocidadNominal || 0);

                    let OEEPlan;

                    if (envTeo == 0) {
                        OEEPlan = 0;
                    }
                    else
                    {
                        OEEPlan = envPlan / envTeo * 100;
                    }

                    if (OEEPlan != 0) {
                        if (OEEPlan <= l.oeeCritico) {
                            $(".oeePlan[data_id='" + l.idLinea + "']").css("color", "red");
                        }
                        else if (OEEPlan >= l.oeeObjetivo) {
                            $(".oeePlan[data_id='" + l.idLinea + "']").css("color", "limegreen");
                        }
                        else {
                            $(".oeePlan[data_id='" + l.idLinea + "']").css("color", "darkorange");
                        }
                    }
                    else
                    {
                        $(".oeePlan[data_id='" + l.idLinea + "']").css("color", "initial");
                    }
                    $(".oeePlan[data_id='" + l.idLinea + "']").html(OEEPlan.toFixed(2));
                }
            },
            ModalEditar: function (wo) {
                let self = this;

                let maxHeight = $("#center-pane").outerHeight() * 1.1;
                let data = {
                    wo: wo,
                    height: maxHeight - 190
                }

                let ventanaEditar = $("<div id='window-editar'/>").kendoWindow({
                    title: window.app.idioma.t("EDITAR_WO"),
                    maxHeight: maxHeight,
                    close: function () {
                        self.schedulerTooltip.activo = true;
                        kendoWindowEditar.destroy();
                    },
                    resizable: false,
                    modal: true
                })

                let kendoWindowEditar = ventanaEditar.getKendoWindow();

                let template = kendo.template($("#editarWOTemplate").html());
                kendoWindowEditar
                    .content(template(data));

                kendo.init(ventanaEditar);

                // Valor inicial de kendoDatePickers
                ventanaEditar.find("[data-role='datetimepicker']").each((idx, elem) => {
                    let kdtp = $(elem).getKendoDateTimePicker();
                    kdtp.value(new Date(kdtp.options.value));
                    kdtp.bind("change", (e) => { self.OnChangeEditor(wo.id, $(elem).data("editorwoinpt")); });
                })

                // onchange kendonumerictextbox
                ventanaEditar.find("[data-role='numerictextbox']").each((idx, elem) => {
                    let kntb = $(elem).getKendoNumericTextBox();
                    kntb.bind("change", (e) => { self.OnChangeEditor(wo.id, $(elem).data("editorwoinpt")); });
                })

                //configuracion input duracionPreparacion
                let inptDP = $("#inpt_duracionPrep_" + wo.id).getKendoMaskedTextBox();
                if (wo.decodificarDatosPreparacion().config != self.constConfigPreparacion.Manual) {
                    inptDP.readonly(true);
                }
                inptDP.bind("change", (e) => { self.OnChangeEditor(wo.id, $("#inpt_duracionPrep_" + wo.id).data("editorwoinpt")); });

                // DropDownList de tipos arranque
                let arranquesDDL = $("#inpt_tipoPreparacion_" + wo.id).getKendoDropDownList();
                if (arranquesDDL && wo.tiemposArranque) {
                    let ds = [{ Codigo: 0, Descripcion: "- " + window.app.idioma.t("AUTOMATICO").toUpperCase() + " -", Tiempo: 0 }];
                    ds = ds.concat(wo.tiemposArranque.map(m => {
                        return {
                            Codigo: m.id,
                            Descripcion: m.nombre,
                            Tiempo: m.tiempo
                        }
                    }))
                    ds = ds.concat([
                        {
                            Codigo: 20,
                            Descripcion: window.app.idioma.t("PLANIFICADOR_CONFIG_CAMBIO").toUpperCase(),
                            Tiempo: 0
                        },
                        {
                            Codigo: 21,
                            Descripcion: window.app.idioma.t("PLANIFICADOR_CONFIG_MANUAL").toUpperCase(),
                            Tiempo: 0
                        }
                    ]);
                    let arranquesDS = new kendo.data.DataSource({
                        data: ds
                    })
                    
                    arranquesDDL.setDataSource(arranquesDS);
                    arranquesDDL.value(arranquesDDL.options.value);
                    arranquesDDL.bind("change", (e) => { self.OnChangeEditor(wo.id, self.constEditorWOInput.TipoPreparacion); });
                }

                // DropDownList de lineas
                let lineasDDL = $("#inpt_linea_" + wo.id).getKendoDropDownList();
                if (lineasDDL) {
                    let lineasDS = new kendo.data.DataSource({
                        data: wo.orden.idLineas.map(m => {
                            return {
                                Codigo: m,
                                Descripcion: ObtenerLineaDescripcion(m),
                                Color: self.datosMES.lineas.find(f => f.idLinea == m).color
                            }
                        })
                    })

                    lineasDDL.setDataSource(lineasDS);
                    lineasDDL.value(lineasDDL.options.value);
                    lineasDDL.bind("change", (e) => { self.OnChangeEditor(wo.id, self.constEditorWOInput.Linea); });
                }

                // Configuramos los botones
                $("#btnEditarWOCancelar").click((e) => {
                    kendoWindowEditar.close();
                })

                $("#btnEditarWOAceptar").click((e) => {
                    if (!ValidarFormulario("window-editar")) {
                        OpenWindow(window.app.idioma.t("ATENCION"),
                            ObtenerCamposObligatorios("window-editar"))
                        return;
                    }

                    let id = wo.id;

                    let fechaInicioWO = $("#inpt_fechaInicioWO_" + id).getKendoDateTimePicker().value();
                    let duracionPrep = self.conversorDuracionMinutos($("#inpt_duracionPrep_" + id).getKendoMaskedTextBox().value());
                    let tipoPreparacionInpt = $("#inpt_tipoPreparacion_" + id);
                    //let tipoPreparacion = tipoPreparacionInpt.data("value");
                    let autoAjuste = $("#inpt_auto_ajuste_" + id).is(':checked');
                    let cantidadPalets = $("#inpt_cantidadPalets_" + id).getKendoNumericTextBox().value();
                    let linea = $("#inpt_linea_" + id).getKendoDropDownList().value();
                    let velocidadNominal = $("#inpt_velocidadNominal_" + id).getKendoNumericTextBox().value();
                    let OEE = $("#inpt_OEE_" + id).getKendoNumericTextBox().value();
                    //let notas = CodificarEnHTML($("#inpt_Notas_" + id).val());
                    let notas = $("#inpt_Notas_" + id).val();

                    let datosTP = {
                        config: tipoPreparacionInpt.data("configprep"),
                        tipo: tipoPreparacionInpt.data("tipoprep"),
                        idArranque: tipoPreparacionInpt.data("arranqueprep"),
                        duracion: duracionPrep,
                        tiemposArranque: wo.tiemposArranque
                    }

                    wo.codificarDatosPreparacion(datosTP);

                    // Si la linea ha cambiado borramos la lista de arranques de la WO para que se recargue de nuevo
                    if (linea != wo.idLinea) {
                        wo.tiemposArranque = null;
                    }

                    wo.idLinea = linea;
                    wo.inicioWO = new Date(fechaInicioWO);                    
                    wo.cantidad = cantidadPalets;
                    wo.parametrosLinea.velocidadNominal = velocidadNominal;
                    wo.parametrosLinea.OEE = OEE;
                    wo.descripcion = notas;
                    if (wo.inicioWOAnterior.getWeek() != wo.inicioWO.getWeek()) {
                        wo.cambiaSemana = true;
                    }
                    wo.autoAjuste = autoAjuste;

                    kendoWindowEditar.close();
                    self.sch.ctrlKeyPressed = e.ctrlKey;
                    self.sch.fromEditor = true;

                    self.sch.ordenarWO([wo.idLinea], wo, null);
                })

                $("#btnEditarWOEliminar").click((e) => {
                    self.EliminarEventoSch(wo);
                    kendoWindowEditar.close();
                })

                $("#btnEditarWOCopiar").click((e) => {
                    kendoWindowEditar.close();

                    new vistaCrear({
                        parent: self,
                        copy: {
                            fechaFin: wo.end,
                            idLinea: wo.idLinea,
                            idProducto: wo.idProducto,
                            cantidad: wo.cantidad,
                            notas: wo.descripcion
                        },
                        callback: function (woCopy) {
                            let woSCH = new Evento(new WO(woCopy))
                            woSCH.inicioFijo = true;

                            self.AsignarDatosMESWO(woSCH, woSCH.parametrosLinea.velocidadNominal == null, woSCH.relacionesEnvases.envasesPalet == null);

                            self.sch.dataSource.add(woSCH);
                            self.sch.ordenarWO([woSCH.idLinea], woSCH, null);
                        }
                    });
                })       

                kendoWindowEditar.center().open();
            },
            BloquearEditor: function (bloqueoFechaFin) {
                let idBloquear = bloqueoFechaFin ? "inpt_bloquearFechaFin" : "inpt_bloquearCantidad";
                let idDesbloquear = !bloqueoFechaFin ? "inpt_bloquearFechaFin" : "inpt_bloquearCantidad";

                $("#" + idBloquear).data("active", 1);
                $("#" + idBloquear).removeClass("k-i-unlock");
                $("#" + idBloquear).addClass("k-i-lock");

                $("#" + idDesbloquear).data("active", 0);
                $("#" + idDesbloquear).removeClass("k-i-lock");
                $("#" + idDesbloquear).addClass("k-i-unlock");
            },
            OnChangeEditor: function (id, inputModificado) {
                let self = this;

                if (!self.sch) {
                    return;
                }
                let wo = self.sch.dataSource.data().find(f => f.id == id);
                // Inputs del editor
                let fechaInicioInpt = $("#inpt_fechaInicio_" + id).getKendoDateTimePicker();
                let fechaInicioWOInpt = $("#inpt_fechaInicioWO_" + id).getKendoDateTimePicker();
                let fechaFinInpt = $("#inpt_fechaFin_" + id).getKendoDateTimePicker();
                let duracionPrepInpt = $("#inpt_duracionPrep_" + id).getKendoMaskedTextBox();
                let tipoPreparacionInpt = $("#inpt_tipoPreparacion_" + id).getKendoDropDownList();
                let autoAjusteInpt = $("#inpt_auto_ajuste_" + id);
                let cantidadPaletsInpt = $("#inpt_cantidadPalets_" + id).getKendoNumericTextBox();
                let cantidadCajasInpt = $("#inpt_cantidadCajas_" + id).getKendoNumericTextBox();
                let cantidadHLInpt = $("#inpt_cantidadHectolitros_" + id).getKendoNumericTextBox();
                let lineaInpt = $("#inpt_linea_" + id).getKendoDropDownList();
                let velocidadNominalInpt = $("#inpt_velocidadNominal_" + id).getKendoNumericTextBox();
                let OEEInpt = $("#inpt_OEE_" + id).getKendoNumericTextBox();
                let bloqueoFechaFin = $("#inpt_bloquearFechaFin").data("active") == 1;
               
                if (!fechaInicioInpt || !fechaInicioWOInpt || !fechaFinInpt || !duracionPrepInpt || !tipoPreparacionInpt
                    || !autoAjusteInpt.length || !cantidadPaletsInpt || !cantidadCajasInpt || !cantidadHLInpt
                    || !lineaInpt || !velocidadNominalInpt || !OEEInpt) {
                    return;
                }

                let datosEditor = {
                    inicio: fechaInicioInpt.value(),
                    duracionPrep: self.conversorDuracionMinutos(duracionPrepInpt.value()) || 0,
                    inicioWO: fechaInicioWOInpt.value(),
                    fin: fechaFinInpt.value(),
                    bloqueoFechaFin: bloqueoFechaFin,
                    tipoPreparacion: parseInt(tipoPreparacionInpt.value()) || 0,                    
                    autoAjuste: autoAjusteInpt.is(':checked'),
                    cantidad: cantidadPaletsInpt.value(),
                    cantidadCajas: cantidadCajasInpt.value(),
                    cantidadHL: cantidadHLInpt.value(),
                    idLinea: lineaInpt.value(),
                    vn: velocidadNominalInpt.value(),
                    OEE: OEEInpt.value(),

                    datosTP: null,
                    offsetTP: 0,
                    offsetD: 0,
                    velocidad: 0,
                    duracion: 0,
                    inicioValido: true,
                    inicioWOValido: true,
                    finValido: true
                }

                if (!wo || !datosEditor.idLinea || !datosEditor.inicio || !datosEditor.inicioWO || !datosEditor.cantidad
                    || (!datosEditor.cantidadCajas && wo.relacionesEnvases.CPBPalet != 0) || !datosEditor.cantidadHL) {
                    return;
                }

                if (!datosEditor.vn || !datosEditor.OEE) {
                    let p = self.datosMES.parametrosLinea.find(f => f.idLinea == datosEditor.idLinea && f.idProducto == wo.idProducto);
                    if (!p) {
                        p = self.datosMES.parametrosLinea.defecto;
                    }

                    datosEditor.vn = datosEditor.vn || p.velocidadNominal;
                    datosEditor.OEE = datosEditor.OEE || p.OEE;
                }

                //let datosPrep = { ...wo.decodificarDatosPreparacion() };
                datosEditor.datosTP = { ...wo.decodificarDatosPreparacion() };
                if (datosEditor.tipoPreparacion == 0) {
                    datosEditor.datosTP.config = 0;
                } else if (datosEditor.tipoPreparacion == 21) { // Opcion Manual
                    datosEditor.datosTP.config = 2;
                    datosEditor.datosTP.duracion = datosEditor.duracionPrep;
                } else {
                    datosEditor.datosTP.config = 1;
                    if (datosEditor.tipoPreparacion == 20) { // Opcion Semiautomatica - Cambio
                        datosEditor.datosTP.tipo = self.constTipoPreparacion.Cambio;
                    } else {
                        datosEditor.datosTP.tipo = self.constTipoPreparacion.Arranque;
                        datosEditor.datosTP.idArranque = datosEditor.tipoPreparacion;
                    }
                }

                let actualizarDatosPreparación = false;
                datosEditor.velocidad = wo._velocidadProduccion(datosEditor.vn, datosEditor.OEE);

                switch (inputModificado) {                    
                    case self.constEditorWOInput.HoraInicio:
                        let actualTiempoPreparacion = 0;
                        datosEditor.datosTP = self.ObtenerTiempoPreparacionWO(id, datosEditor.autoAjuste, datosEditor.datosTP, datosEditor.idLinea, datosEditor.inicio.addMins(actualTiempoPreparacion), wo.idProducto, self.sch, null);
                        while (actualTiempoPreparacion != datosEditor.datosTP.duracion) {
                            actualTiempoPreparacion = datosEditor.datosTP.duracion;
                            datosEditor.datosTP = self.ObtenerTiempoPreparacionWO(id, datosEditor.autoAjuste, datosEditor.datosTP, datosEditor.idLinea, datosEditor.inicio.addMins(datosEditor.datosTP.duracion), wo.idProducto, self.sch, null);
                        }

                        datosEditor.offsetTP = self.sch.calcularOffsetsDuracionWO(datosEditor.idLinea, datosEditor.inicio, datosEditor.inicio.addMins(datosEditor.datosTP.duracion));
                        datosEditor.inicioWO = datosEditor.inicio.addMins(datosEditor.datosTP.duracion + datosEditor.offsetTP);

                        actualizarDatosPreparación = true;

                        break;
                    case self.constEditorWOInput.HoraInicioWO:
                        datosEditor.datosTP = self.ObtenerTiempoPreparacionWO(id, datosEditor.autoAjuste, datosEditor.datosTP, datosEditor.idLinea, datosEditor.inicioWO, wo.idProducto, self.sch, null);

                        datosEditor.offsetTP = self.sch.calcularOffsetsDuracionWO(datosEditor.idLinea, datosEditor.inicioWO.addMins(-datosEditor.datosTP.duracion), datosEditor.inicioWO, true);
                        datosEditor.inicio = datosEditor.inicioWO.addMins(-(datosEditor.datosTP.duracion + datosEditor.offsetTP));

                        actualizarDatosPreparación = true;

                        break;
                    case self.constEditorWOInput.HoraFin:
                        if (!datosEditor.bloqueoFechaFin || datosEditor.inicioWO >= datosEditor.fin) {
                            // La cantidad está bloqueada, o la fecha de fin es anterior a la de inicio, movemos la fecha de Inicio
                            if (datosEditor.fechaInicioWO >= datosEditor.fechaFin) {
                                datosEditor.cantidad = 100;
                            }
                            datosEditor.duracion = wo._duracion(datosEditor.cantidad, datosEditor.velocidad);
                            datosEditor.offsetD = self.sch.calcularOffsetsDuracionWO(datosEditor.idLinea, datosEditor.fin.addMins(-datosEditor.duracion), datosEditor.fin.addSecs(-1), true);
                            datosEditor.inicioWO = datosEditor.fin.addMins(-(datosEditor.duracion + datosEditor.offsetD));

                            datosEditor.datosTP = self.ObtenerTiempoPreparacionWO(id, datosEditor.autoAjuste, datosEditor.datosTP, datosEditor.idLinea, datosEditor.inicioWO, wo.idProducto, self.sch, null);
                            datosEditor.offsetTP = self.sch.calcularOffsetsDuracionWO(datosEditor.idLinea, datosEditor.inicioWO.addMins(-datosEditor.datosTP.duracion), datosEditor.inicioWO, true);
                            datosEditor.inicio = datosEditor.inicioWO.addMins(-(datosEditor.datosTP.duracion + datosEditor.offsetTP));

                            actualizarDatosPreparación = true;

                        } else {
                            // La cantidad está desbloqueada, la cambiamos para que cuadre con la duracion de la wo                            
                            datosEditor.cantidad = wo._nuevaCantidad(self.sch, datosEditor.inicioWO, datosEditor.fin, datosEditor.velocidad);                            
                            datosEditor.duracion = wo._duracion(datosEditor.cantidad, datosEditor.velocidad);
                            datosEditor.offsetD = self.sch.calcularOffsetsDuracionWO(datosEditor.idLinea, datosEditor.inicioWO, datosEditor.inicioWO.addMins(datosEditor.duracion));
                        }

                        break
                    case self.constEditorWOInput.DuracionPreparacion:
                        duracionPrepInpt.value(self.conversorMinutosDuracion(datosEditor.duracionPrep));

                        datosEditor.offsetTP = self.sch.calcularOffsetsDuracionWO(datosEditor.idLinea, datosEditor.inicio, datosEditor.inicio.addMins(datosEditor.duracionPrep));
                        datosEditor.inicioWO = datosEditor.inicio.addMins(datosEditor.duracionPrep + datosEditor.offsetTP);

                        
                        break;
                    case self.constEditorWOInput.TipoPreparacion:
                        datosEditor.datosTP = self.ObtenerTiempoPreparacionWO(id, datosEditor.autoAjuste, datosEditor.datosTP, datosEditor.idLinea, datosEditor.inicioWO, wo.idProducto, self.sch, null);

                        datosEditor.offsetTP = self.sch.calcularOffsetsDuracionWO(datosEditor.idLinea, datosEditor.inicio, datosEditor.inicio.addMins(datosEditor.datosTP.duracion));
                        datosEditor.inicioWO = datosEditor.inicio.addMins(datosEditor.datosTP.duracion + datosEditor.offsetTP);
                        actualizarDatosPreparación = true;

                        break;
                    //case self.constEditorWOInput.AutoAjuste:
                    //    moverFechaFin();
                    //    actualizarDuracion();

                    //    break;
                    case self.constEditorWOInput.CantidadPalets:
                        datosEditor.bloqueoFechaFin = false;

                        break;
                    case self.constEditorWOInput.CantidadCajas:
                        datosEditor.bloqueoFechaFin = false;
                        datosEditor.cantidad = Math.round(datosEditor.cantidadCajas / wo.relacionesEnvases.CPBPalet);

                        break;
                    case self.constEditorWOInput.CantidadHectolitros:
                        datosEditor.bloqueoFechaFin = false;
                        datosEditor.cantidad = Math.round(datosEditor.cantidadHL / wo.relacionesEnvases.hectolitrosEnvase / wo.relacionesEnvases.envasesPalet);
                        break;
                    case self.constEditorWOInput.Linea:
                        datosEditor.datosTP.tiemposArranque = null;
                        datosEditor.datosTP = self.ObtenerTiempoPreparacionWO(id, datosEditor.autoAjuste, datosEditor.datosTP, datosEditor.idLinea, datosEditor.inicioWO, wo.idProducto, self.sch, null);
                        let paramsLinea = self.datosMES.parametrosLinea.datos.find(f => f.idLinea == datosEditor.idLinea && f.idProducto == wo.idProducto);
                        if (!paramsLinea) {
                            paramsLinea = self.datosMES.parametrosLinea.defecto;
                        }

                        datosEditor.vn = paramsLinea.velocidadNominal;
                        velocidadNominalInpt.value(datosEditor.vn);
                        datosEditor.OEE = paramsLinea.OEE;
                        OEEInpt.value(datosEditor.OEE);

                        datosEditor.velocidad = wo._velocidadProduccion(datosEditor.vn, datosEditor.OEE);

                        datosEditor.offsetTP = self.sch.calcularOffsetsDuracionWO(datosEditor.idLinea, datosEditor.inicioWO.addMins(-datosEditor.datosTP.duracion), datosEditor.inicioWO, true);
                        datosEditor.inicio = datosEditor.inicioWO.addMins(-(datosEditor.datosTP.duracion + datosEditor.offsetTP));

                        actualizarDatosPreparación = true;

                        break;
                }

                // Actualizamos los datos (consideramos que las fechas de Inicio y de InicioWO ya están calculadas previamente);
                if (inputModificado != self.constEditorWOInput.HoraFin) {
                    if (!datosEditor.bloqueoFechaFin || datosEditor.inicioWO >= datosEditor.fin) {
                        // La cantidad esta bloqueada, o la fecha de inicio es posterior a la de fin. Movemos la fecha de fin

                        if (datosEditor.fechaInicioWO >= datosEditor.fechaFin) {
                            datosEditor.cantidad = 100;
                        }

                        datosEditor.duracion = wo._duracion(datosEditor.cantidad, datosEditor.velocidad);
                        datosEditor.offsetD = self.sch.calcularOffsetsDuracionWO(datosEditor.idLinea, datosEditor.inicioWO, datosEditor.inicioWO.addMins(datosEditor.duracion));                        

                    } else {
                        // Cambiamos la cantidad para que termine en la fecha de fin definida
                        datosEditor.cantidad = wo._nuevaCantidad(self.sch, datosEditor.inicioWO, datosEditor.fin, datosEditor.velocidad);
                        datosEditor.duracion = wo._duracion(datosEditor.cantidad, datosEditor.velocidad);
                        datosEditor.offsetD = self.sch.calcularOffsetsDuracionWO(datosEditor.idLinea, datosEditor.inicioWO, datosEditor.inicioWO.addMins(datosEditor.duracion));
                    }
                }

                datosEditor.fin = datosEditor.inicioWO.addMins(datosEditor.duracion + datosEditor.offsetD);

                fechaInicioInpt.value(datosEditor.inicio.addSecs(0));
                fechaInicioWOInpt.value(datosEditor.inicioWO.addSecs(0));
                fechaFinInpt.value(datosEditor.fin.addSecs(0));

                cantidadPaletsInpt.value(datosEditor.cantidad);
                cantidadCajasInpt.value(datosEditor.cantidad * wo.relacionesEnvases.CPBPalet);
                cantidadHLInpt.value(datosEditor.cantidad * wo.relacionesEnvases.envasesPalet * wo.relacionesEnvases.hectolitrosEnvase);

                $("#lbl_envases").html(datosEditor.cantidad * wo.relacionesEnvases.envasesPalet);
                $("#editorWO_duracion").html(ConversorHorasMinutos(datosEditor.duracion * 60));
                if (datosEditor.offsetD) {
                    $("#duracionTotal").html(window.app.idioma.t('DURACION_REAL') + ": " + ConversorHorasMinutos(datosEditor.offsetD * 60));
                    $("#duracionTotal").attr("title", window.app.idioma.t('DURACION_REAL')
                        + ' (' + ConversorHorasMinutos((datosEditor.duracion + datosEditor.offsetD) * 60) + ' '
                        + (window.app.idioma.t('NO_PLANIFICADO') || "no planificado") + ')');
                } else {
                    $("#duracionTotal").html("");
                }
                if (datosEditor.offsetTP) {
                    $("#duracionPrepTotal").html(ConversorHorasMinutos(datosEditor.offsetTP * 60));
                    $("#duracionPrepTotal").attr("title", window.app.idioma.t('DURACION_REAL')
                        + ' (' + ConversorHorasMinutos((datosEditor.duracionPrep + datosEditor.offsetTP) * 60) + ' '
                        + (window.app.idioma.t('NO_PLANIFICADO') || "no planificado") + ')');
                } else {
                    $("#duracionPrepTotal").html("");
                }

                fechaInicioInpt.element.css("color", self.sch.turnoPlanificado(datosEditor.idLinea, datosEditor.inicio.addSecs(1)) ?
                    "black" : "red");
                fechaInicioWOInpt.element.css("color", self.sch.turnoPlanificado(datosEditor.idLinea, datosEditor.inicioWO.addSecs(1)) ?
                    "black" : "red");
                fechaFinInpt.element.css("color", self.sch.turnoPlanificado(datosEditor.idLinea, datosEditor.fin.addSecs(-1)) ?
                    "black" : "red");                

                if (actualizarDatosPreparación) {
                    let cambiado = inputModificado == self.constEditorWOInput.TipoPreparacion;
                    if (cambiado) {
                        $("#inpt_tipoPreparacion_" + id).data("value", datosEditor.tipoPreparacion);
                        $("#inpt_tipoPreparacion_" + id).data("configprep", datosEditor.datosTP.config);
                        $("#inpt_tipoPreparacion_" + id).data("tipoprep", datosEditor.datosTP.tipo);
                        $("#inpt_tipoPreparacion_" + id).data("arranqueprep", datosEditor.datosTP.idArranque);
                        duracionPrepInpt.readonly(datosEditor.datosTP.config != self.constConfigPreparacion.Manual);
                    }
                    else {
                        if (inputModificado == self.constEditorWOInput.Linea) {
                            // actualizamos la lista de tipos de arranque
                            let actualDS = tipoPreparacionInpt.dataSource.data();
                            let nuevoDS = [actualDS[0]];
                            nuevoDS = nuevoDS.concat(datosEditor.datosTP.tiemposArranque.map(m => {
                                return {
                                    Codigo: m.id,
                                    Descripcion: m.nombre,
                                    Tiempo: m.tiempo
                                }
                            }))
                            nuevoDS = nuevoDS.concat(actualDS.filter(f => f.Codigo >= 20));
                            let arranquesDS = new kendo.data.DataSource({
                                data: nuevoDS
                            })

                            tipoPreparacionInpt.setDataSource(arranquesDS);
                            if (!nuevoDS.find(f => f.Codigo == datosEditor.tipoPreparacion)) {
                                datosEditor.tipoPreparacion = 0;
                            }
                            tipoPreparacionInpt.value(datosEditor.tipoPreparacion);
                        }
                    }

                    $("#lbl_tipoPreparacionSel").html(datosEditor.datosTP.config == self.constConfigPreparacion.Manual ? window.app.idioma.t("PLANIFICADOR_CONFIG_MANUAL") :
                        datosEditor.datosTP.tipo == self.constTipoPreparacion.Arranque ? window.app.idioma.t("PLANIFICADOR_CONFIG_ARRANQUE") :
                            window.app.idioma.t("PLANIFICADOR_CONFIG_CAMBIO"));

                    duracionPrepInpt.value(self.conversorMinutosDuracion(datosEditor.datosTP.duracion));
                    //$("#lbl_tiempoPreparacion").html(ConversorHorasMinutosSegundos(datosTP.duracion * 60));
                    //$("#lbl_tiempoPreparacion").data("value", datosTP.duracion);
                    $("#lbl_tipoPreparacion").html(datosEditor.datosTP.config == self.constConfigPreparacion.Automatico && datosEditor.datosTP.tipo == self.constTipoPreparacion.Arranque ?
                        datosEditor.datosTP.tiemposArranque.find(f => f.id == datosEditor.datosTP.idArranque).nombre :
                        datosEditor.datosTP.config == self.constConfigPreparacion.Automatico ? window.app.idioma.t("PLANIFICADOR_CONFIG_CAMBIO") : '');
                }
            },
            EliminarEventoSch: function (wo) {
                let self = this;

                let sch = self.sch;
                let grid = self.grid;
                let origen = wo.origen();
                let id = wo._id();

                if (origen != self.constOrigenWO.JDE) {
                    // Si es una WO ya planificada en MES, pedimos confirmación para borrarla. 
                    // Se creará un registro temporal en el GRID inferior para poder recuperarla.
                    OpenWindow(window.app.idioma.t("ATENCION"),
                        window.app.idioma.t("PLANIFICADOR_CONFIRMAR_BORRAR_WO_SECUENCIADAS_MES"),
                        async () => {
                            kendo.ui.progress($("#divHTMLContenido"), true);

                            let cloned = wo._clonar();
                            cloned.visibleEnGrid = true;
                            cloned.temporal = true;

                            grid.dataSource.add(cloned);
                            kendo.ui.progress($("#divHTMLContenido"), false);

                            sch.dataSource.remove(wo);
                            sch.ordenarWO([wo.idLinea], null, wo);
                        }
                    );
                } else {
                    let gridItem = grid.dataSource.data().find(f => f.id == wo.id);
                    if (gridItem) {
                        gridItem.visibleEnGrid = true;
                        grid.applyFilter();
                    }

                    sch.dataSource.remove(wo);
                    sch.ordenarWO([wo.idLinea], null, wo);
                }
            },
            IniciarGrid: function (WOPlanificadasJDE) {
                let self = this;

                if (!kendo.ui.Grid.prototype.applyFilter) {
                    kendo.ui.Grid.prototype.applyFilter = function () {
                        let filter = this.dataSource.filter();
                        this.dataSource.filter(filter);
                    }
                }

                let gridDS = new kendo.data.DataSource({
                    data: WOPlanificadasJDE,
                    schema: self.WOSchema,
                    pageSize: 20,
                    filter: [{
                        field: "visibleEnGrid",
                        operator: "eq",
                        value: true
                    }]
                });
                if (!$("#OrdersGrid").getKendoGrid()) {
                    self.grid = null;
                }
                if (!self.grid) {
                    self.grid = $("#OrdersGrid").kendoGrid({
                        selectable: "single row",
                        dataSource: gridDS,
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                        },
                        sortable: true,
                        resizable: true,
                        scrollable: true,
                        pageable: {
                            refresh: false,
                            pageSizes: [20, 50, 100],
                            buttonCount: 5,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        filterMenuInit: function (e) {
                            if (e.field === "idProducto") {
                                let f = this.thead.find("[data-field='"+e.field+"']").getKendoFilterMultiCheck();
                                f.container.empty();
                                f.checkSource.sort({ field: e.field, dir: "asc" });
                                f.checkSource.data(f.checkSource.view().toJSON());
                                f.createCheckBoxes();
                            }
                        },
                        dataBound: function (e) {

                            let sch = self.sch;
                            let grid = e.sender;

                            // Si existen filas con productos que no estén en MES, agregamos una clase a la fila
                            // Para saber si un producto no está en MES, el campo idLineas del elemento será array vacio []

                            for (let r of Array.from(grid.dataSource.data())) {
                                let row = grid.tbody.find("tr[data-uid='" + r.uid + "']");

                                if (r.orden.idLineas.length == 0) {                                    
                                    row.addClass("no_MES_product");
                                    row.attr("title", window.app.idioma.t("NO_COMBINACION_LINEA_PRODUCTO_MES"));
                                } else if (self.datosMES.productosSIGI.find(f => f.Id == r.orden.idProducto) == null) {
                                    row.addClass("no_SIGI_product");
                                    row.attr("title", window.app.idioma.t("NO_PRODUCTO_SIGI"));
                                } else if (!self.datosMES.productosSIGI.find(f => f.Id == r.orden.idProducto).Info[0]) {
                                    row.addClass("no_SIGI_sign");
                                    row.attr("title", window.app.idioma.t("NO_FIRMA_SIGI"));
                                }
                            }

                            if (sch && grid) {
                                // aplicamos en el calendario los filtros que tenga el grid
                                let filtros = grid.dataSource.filter();
                                let filtrosSCH = JSON.parse(JSON.stringify(filtros));
                                filtrosSCH.filters = filtrosSCH.filters.filter(f => f.filters ?
                                    f.filters.find(f2 => f2.field == "idLinea" /*|| f2.field == "semana"*/ || f2.field == "idProducto") != null :
                                    f.field == "idLinea" /*|| f.field == "semana"*/ || f.field == "idProducto");

                                sch.dataSource.filter(filtrosSCH);
                            }
                        },
                        columns: [
                            {
                                field: "title",
                                title: window.app.idioma.t("ID"),
                                //width: 150,
                            },
                            {
                                field: "idLinea",
                                title: window.app.idioma.t("LINEA"),
                                template: "<span>#=ObtenerLineaDescripcion(idLinea)#</span>",
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=idLinea#' style='width: 14px;height:14px;margin-right:5px;'/>#: ObtenerLineaDescripcion(idLinea)#</label></div>";
                                        }
                                    },
                                    dataSource: {
                                        data: self.datosMES.lineas
                                    }
                                }
                            },
                            {
                                field: "semana",
                                title: window.app.idioma.t("SEMANA"),
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=semana#' style='width: 14px;height:14px;margin-right:5px;'/>#:semana#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "fechaEntregaHelper",
                                title: window.app.idioma.t("FECHA_SOLICITADA"),
                                format: "{0:" + kendo.culture().calendar.patterns.MES_Fecha + "}"
                            },
                            {
                                field: "cantidad",
                                title: window.app.idioma.t("CANTIDAD"),
                            },
                            {
                                field: "idProducto",
                                title: window.app.idioma.t("PRODUCTO"),
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=idProducto#' style='width: 14px;height:14px;margin-right:5px;'/>#:idProducto#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "descripcionProducto",
                                title: window.app.idioma.t("DESCRIPCION_PRODUCTO"),
                            },
                            {
                                field: "uom",
                                title: window.app.idioma.t("UD_MEDIDA"),
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=uom#' style='width: 14px;height:14px;margin-right:5px;'/>#:uom#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "duracion",
                                title: window.app.idioma.t("DURACION"),
                                template: "#=ConversorHorasMinutosSegundos(duracion*60)#",
                                format: "{0:HH:mm:ss}"
                                //format: "{0:n2}"
                            },

                        ]
                    }).getKendoGrid();

                    // Configuramos el draggable para poder arrastrar las WO al Scheduler
                    self.grid.table.kendoDraggable({
                        filter: "tbody > tr:not(.no_MES_product):not(.no_SIGI_product)",
                        dragstart: function (e) {
                            // Add a margin to position correctly the tooltip under the pointer.
                            let gridRowOffset = self.grid.tbody.find("tr:first").offset();
                            $("#dragTooltip").css("margin-left", e.clientX - gridRowOffset.left - 50);

                            self.schedulerTooltip.activo = false;
                        },
                        hint: function (row) {

                            // Remove the old selection.
                            row.parent().find(".k-state-selected").each(function () {
                                $(this).removeClass("k-state-selected")
                            })

                            // Add the selected class to the current row.
                            row.addClass("k-state-selected");

                            if (!self.sch) {
                                return;
                            }

                            // Creamos el draggable con el color de la línea que toque y con el ancho acorde a su duración
                            let dataItem = self.grid.dataItem(row);
                            let template = kendo.template($('#orderTemplateDraggable').html());

                            let orderWidth = self.sch.anchoPorDuracion(dataItem.duracion);
                            let data = {
                                bgColor: self.datosMES.lineas.find(l => l.value == dataItem.idLinea).color,
                                width: orderWidth,
                                title: dataItem.title,
                                description: dataItem.description
                            }
                            return template(data);
                        }
                    });
                } else {
                    self.grid.setDataSource(gridDS);
                }
            },
            ConfigurarDropAreaScheduler: function (scheduler) {
                let self = this;
                
                scheduler.view().content.kendoDropTargetArea({
                    filter: ".k-scheduler-table td, .k-event",
                    drop: function (e) {
                        self.schedulerTooltip.activo = true;

                        // Aquí capturamos sólo los drops desde el grid
                        if (e.draggable.currentTarget.is("tr")) {

                            if (!self.grid) {
                                return;
                            }
                            let dataItem = self.grid.dataItem(self.grid.select());
                            let cloned = dataItem._clonar();

                            if (dataItem && cloned) {
                                if (!dataItem.temporal) {
                                    dataItem.visibleEnGrid = false;
                                    self.grid.applyFilter();
                                } else {
                                    cloned.temporal = false;
                                    self.grid.dataSource.remove(dataItem);
                                }

                                cloned.start = new Date(cloned.inicioWO.getTime());
                                cloned.nueva = true;
                                scheduler.dataSource.add(cloned);
                                scheduler.ordenarWO([cloned.idLinea], cloned);
                            }
                        }
                    }
                });
            },
            ModalCrearWO: function () {
                let self = this;

                new vistaCrear({
                    parent: self,
                    copy: null,
                    callback: function (wo) {
                        let woSCH = new Evento(new WO(wo))
                        woSCH.inicioFijo = true;

                        self.AsignarDatosMESWO(woSCH, woSCH.parametrosLinea.velocidadNominal == null, woSCH.relacionesEnvases.envasesPalet == null);

                        self.sch.dataSource.add(woSCH);
                        self.sch.ordenarWO([woSCH.idLinea], woSCH, null);
                    }
                });
            },
            recalcularFechaFin: function (idLinea, idProducto, cantidad, fechaInicio) {
                let self = this;

                return new Promise((resolve, reject) => {
                    let d = self.datosMES.parametrosLinea.datos.find(f => f.idLinea == idLinea && f.idProducto == idProducto);
                    if (!d) {
                        d = self.datosMES.parametrosLinea.defecto;
                    }

                    let vn = d.velocidadNominal;
                    let OEE = d.OEE;

                    let r = self.datosMES.relacionEnvasesProductos.datos.find(f => f.idProducto == idProducto);
                    if (!r) {
                        r = self.datosMES.relacionEnvasesProductos.defecto;
                    }

                    let envasesPalet = r.envasesPorPalet;

                    let velocidad = (vn * OEE / 100);
                    let cantidadEnvases = cantidad * envasesPalet;
                    let duracion = Math.ceil((cantidadEnvases / velocidad) * 60);

                    let duracionOffset = self.sch.calcularOffsetsDuracionWO(idLinea, fechaInicio, fechaInicio.addMins(duracion));

                    resolve(fechaInicio.addMins(duracion + duracionOffset));
                });
            },
            recalcularCantidad: function (idLinea, idProducto, fechaInicio, fechaFin) {
                let self = this;

                return new Promise((resolve, reject) => {
                    let d = self.datosMES.parametrosLinea.datos.find(f => f.idLinea == idLinea && f.idProducto == idProducto);
                    if (!d) {
                        d = self.datosMES.parametrosLinea.defecto;
                    }

                    let vn = d.velocidadNominal;
                    let OEE = d.OEE;

                    let r = self.datosMES.relacionEnvasesProductos.datos.find(f => f.idProducto == idProducto);
                    if (!r) {
                        r = self.datosMES.relacionEnvasesProductos.defecto;
                    }

                    let envasesPalet = r.envasesPorPalet;

                    let velocidad = (vn * OEE / 100);

                    let totalTime = (fechaFin.getTime() - fechaInicio.getTime()) / 60000;                    

                    resolve(Math.floor(((totalTime / 60) * velocidad) / envasesPalet));
                });
            },
            cancelarCalcularFechaFin: function () {

            },
            recalculandoFechaFin: function () {
                return false;
            },
            GuardarPlanificacion: function () {
                let self = this;

                if (!self.sch || !self.grid) {
                    return;
                }

                let modificadosSCH = self.sch.dataSource.data().filter(f => f.modificado() == true);
                let eliminadosSCH = self.grid.dataSource.data().filter(f => f.temporal);

                if (modificadosSCH.length || eliminadosSCH.length) {
                    // Hay datos que actualizar

                    // WO añadidas que hay que crear como Secuenciadas
                    let woCrear = modificadosSCH.filter(f => f.origen() == self.constOrigenWO.JDE || f.origen() == self.constOrigenWO.MANUAL).map(o => o.convertirParaServidor());

                    // WO Secuenciadas que hay que actualizar
                    let woActualizarSec = modificadosSCH.filter(f => f.origen() == self.constOrigenWO.MES).map(o => o.convertirParaServidor());

                    // WO Secuenciadas que hay que eliminar
                    let idsBorrarSec = eliminadosSCH.filter(f => f.origen() == self.constOrigenWO.MES).map(e => e._id());

                    // Registros planifiacados en JDE que hay que cambiar el estado
                    // Estado Secuenciadas (2)
                    let idsSecuenciadas = self.grid.dataSource.data().filter(f => !f.visibleEnGrid && (f.orden.idOriginal).toString().charAt(0) != 0).map(e => e.orden.idOriginal);

                    // Estado Planificadas (1)
                    let idsPlanificadas = eliminadosSCH.filter(f => f.orden.idOriginal && (f.orden.idOriginal).toString().charAt(0) != 0).map(e => e.orden.idOriginal);

                    kendo.ui.progress($("#divHTMLContenido"), true);
                    Promise.all([
                        self.GuardarWOSecuenciadasMES(woCrear),
                        self.ActualizarWOSecuenciadasMES(woActualizarSec),
                        self.EliminarWOSecuenciadasMES(idsBorrarSec),
                        self.ActualizarEstadoWOPlanificadasJDE([],idsSecuenciadas, 2),
                        self.ActualizarEstadoWOPlanificadasJDE([],idsPlanificadas, 1),
                    ])
                        .then(values => {
                            kendo.ui.progress($("#divHTMLContenido"), false);

                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANIFICADOR_EXITO_GUARDADO'), 4000);

                            // Actualizamos de nuevo los componentes
                            self.CargarPlanificador(null, false);
                        })
                        .catch(er => {
                            kendo.ui.progress($("#divHTMLContenido"), false);
                            console.log(er);
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANIFICADOR_ERROR_GUARDANDO_WO'), 3000);
                        })


                } else {
                    OpenWindow(window.app.idioma.t("ATENCION"), window.app.idioma.t("PLANIFICADOR_NO_DATOS_GUARDAR"));
                }
            },
            ModalExportarBorrador: function () {
                let self = this;

                if (self.sch && self.grid) {
                    self.vistaExportar = new vistaExportar(self.sch.view().options.date, { soloInforme: true, borrador: true, callback: null });
                }                
            },
            ModalExportarPlanificacion: function () {
                let self = this;

                if (!self.sch || !self.grid) {
                    return;
                }

                let modificadosSCH = self.sch.dataSource.data().filter(f => f.modificado() == true);
                let eliminadosSCH = self.grid.dataSource.data().filter(f => f.temporal);

                if (modificadosSCH.length || eliminadosSCH.length) {
                    // Cambios sin guardar
                    OpenWindow(window.app.idioma.t("ATENCION"), window.app.idioma.t("CAMBIOS_SIN_GUARDAR"));
                    return;
                }

                self.vistaExportar = new vistaExportar(self.sch.view().options.date, {
                    soloInforme: false,
                    borrador: false,
                    callback:
                        (result) => {
                            self.clienteExportacion = true;
                            self.ExportacionActiva();

                            // un result = false indica que ya hay una exportación en marcha
                            if (!result) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANIFICADOR_EXPORTACION_ACTIVA'), 5000);
                            }
                        }
                });
            },
            ComprobarEstadoExportacion: async function () {

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: `../api/Planificador/ComprobarExportacion`,
                        contentType: "application/json; charset=utf-8",
                        success: function (state) {
                            resolve(state);
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            ExportacionActiva: function() {
                let self = this;

                $("#exportActive").css("display", "flex");
                $("#exportProgress").html("");
            },
            ExportacionIniciada: function () {
                let self = this;

                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANIFICADOR_EXPORTACION_INICIADA'), 5000);
                self.ExportacionActiva();
            },
            ExportacionProgreso: function (data) {
                let self = this;

                $("#exportProgress").html(data.msg);
            },
            ExportacionFinalizada: function(result) {
                let self = this;

                $("#exportActive").hide();

                if (!self.clienteExportacion) {
                    self.CargarPlanificador(null, false);
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANIFICADOR_EXITO_EXPORTAR'), 4000);
                    return
                }

                self.clienteExportacion = false;

                if (result.Item1) {
                    self.CargarPlanificador(null, false);
                    setTimeout(() => {
                        if (result.Item2) {
                            OpenWindow(window.app.idioma.t("ATENCION"), result.Item2, null, { width: "450px"});
                        } else {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANIFICADOR_EXITO_EXPORTAR'), 4000);
                        }
                    })
                }
                else {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANIFICADOR_ERROR_EXPORTAR_WO'), 4000);
                }                
            },
            ActualizarEstadoWOPlanificadasJDE: async function (ids, idsJDE, nuevoEstado) {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "PUT",
                        url: `../api/Planificador/WOPlanificadasJDE/Estados`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify({
                            ids,
                            idsJDE,
                            nuevoEstado,
                            actualizadoPor: window.app.sesion.attributes.usuario || null
                        }),
                        success: function (data) {
                            resolve();
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            GuardarWOSecuenciadasMES: async function (wo) {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: `../api/Planificador/WOSecuenciadasMES`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(wo),
                        success: function (data) {
                            resolve();
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            EliminarWOSecuenciadasMES: async function (wos) {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "PUT",
                        url: `../api/Planificador/WOSecuenciadasMES/borrarLote`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(wos),
                        success: function (data) {
                            resolve();
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            ActualizarWOSecuenciadasMES: async function (wo) {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "PUT",
                        url: `../api/Planificador/WOSecuenciadasMES`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(wo),
                        success: function (data) {
                            resolve();
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            ModalConfiguracion: function () {
                let self = this;

                if (!self.opciones || !self.datosMES.lineas) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANIFICADOR_CONFIGURACION_NO_CARGADA'), 3000);
                    return;
                }

                let data = {
                    opt: self.opciones,
                    lineas: self.datosMES.lineas
                }                

                let ventanaConfiguracion = $("<div id='window-configuracion'/>").kendoWindow({
                    title: window.app.idioma.t("CONFIGURACION"),
                    height: $("#center-pane").outerHeight() * 0.9,
                    close: function () {
                        kendoWindowConfiguracion.destroy();
                    },
                    resizable: false,
                    modal: true
                })

                let kendoWindowConfiguracion = ventanaConfiguracion.getKendoWindow();

                let template = kendo.template($("#configuracionTemplate").html());                
                kendoWindowConfiguracion
                    .content(template(data));

                $(".configuracion-lista").parent().addClass("flex-columnas");
                
                kendo.init(ventanaConfiguracion);

                $(".configuracion-colorpicker").each((idx, elem) => {
                    $(elem).getKendoColorPicker().bind("close", (cp) => {
                        let nuevoValor = [cp.sender.element.data("clave")]
                        nuevoValor.push(rgb2hex(cp.sender.wrapper.find(".k-selected-color").css("background-color")));

                        self.ActualizarOpciones(cp.sender.element.data("optClave"), nuevoValor)
                    })
                });

                kendoWindowConfiguracion.center().open();

                let tipoVistaDDL = $(ventanaConfiguracion).find("[data-role='dropdownlist'][data-opt='VISTA_INICIAL']").getKendoDropDownList();
                if (tipoVistaDDL) {
                    let tipoVistaDS = new kendo.data.DataSource({
                        data: Object.keys(self.constTipoVista).map((key) => {
                            return {
                                Codigo: self.constTipoVista[key].key,
                                Descripcion: window.app.idioma.t(key),
                                Value: self.constTipoVista[key].value
                            }
                        }),
                        sort: { field: "Codigo", dir: "asc" }
                    });
                    tipoVistaDDL.setDataSource(tipoVistaDS);
                    tipoVistaDDL.value(tipoVistaDDL.options.value)
                }

                let candadoEditorDDL = $(ventanaConfiguracion).find("[data-role='dropdownlist'][data-opt='EDITOR_CANDADO_INICIAL']").getKendoDropDownList();
                if (candadoEditorDDL) {
                    let candadoEditorDS = new kendo.data.DataSource({
                        data: Object.keys(self.constCandadoEditor).map((key) => {
                            return {
                                Codigo: self.constCandadoEditor[key],
                                Descripcion: window.app.idioma.t(key)
                            }
                        }),
                        sort: { field: "Codigo", dir: "asc" }
                    });
                    candadoEditorDDL.setDataSource(candadoEditorDS);
                    candadoEditorDDL.value(candadoEditorDDL.options.value)
                }
            },
            OnChangeConfiguracion: function (e, clave, tipo) {
                let inpt = null;
                let self = this;
                if (self) {
                    switch (tipo.toLowerCase()) {
                        case "numerictextbox":
                            inpt = $(e).getKendoNumericTextBox();
                            if (inpt) {
                                let nuevoValor = parseInt(inpt.value());
                                if (inpt.min() == null || nuevoValor >= inpt.min()) {
                                    self.ActualizarOpciones(clave, nuevoValor);
                                }                                
                            }
                            break;
                        case "dropdownlist":
                            inpt = $(e).getKendoDropDownList();
                            if (inpt) {
                                let nuevoValor = parseInt(inpt.value());
                                self.ActualizarOpciones(clave, nuevoValor);
                            }
                            break;
                        case "checkbox":
                            if ($(e).length > 0) {
                                self.ActualizarOpciones(clave, $(e).is(':checked'));
                            }
                            break;
                        case "textbox":
                            if ($(e).length > 0) {
                                self.ActualizarOpciones(clave, $(e).val());
                            }
                            break;
                        default:
                    }
                }
            },
            ActualizarOpciones: async function (keyOpcion, nuevoValor) {
                let self = this;

                let opcion = self.opciones[keyOpcion];

                if (opcion && !self.opcionesMapper.comprobarIguales(opcion, nuevoValor)) {

                    kendo.ui.progress($("#window-configuracion"), true);

                    if (opcion.tipo.toLowerCase() == "dictionary") {
                        opcion.valor[nuevoValor[0]] = nuevoValor[1];
                    } else {
                        opcion.valor = nuevoValor;
                    }
                    
                    let data = self.opcionesMapper.convertirParaServidor(opcion);

                    $.ajax({
                        type: "PUT",
                        url: "../api/Planificador/Configuracion/",
                        dataType: 'json',
                        data: data,
                        complete: function () {
                            kendo.ui.progress($("#window-configuracion"), false);
                        },
                        success: function (data) {
                            self.opciones[data.Clave] = self.opcionesMapper.convertirDesdeServidor(data);
                            self.OpcionesActualizadas(data.Clave);
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), e.responseJSON.Message, 4000);
                            }
                        }
                    });
                }
            },
            OpcionesActualizadas: function (clave) {
                let self = this;
                let sch = $("#OrdersScheduler").getKendoScheduler();

                if (sch && self.opciones) {
                    switch (clave.toUpperCase()) {
                        case "VISTA_INICIAL":
                            if (self.constTipoVista && self.opciones && self.opciones["VISTA_INICIAL"]) {
                                let vista = sch.viewName();
                                for (let a in self.constTipoVista) {
                                    let b = self.constTipoVista[a];
                                    if (b.key == self.opciones["VISTA_INICIAL"].valor) {
                                        vista = b.value;
                                    }
                                }
                                sch.view(vista);
                            }                            
                            break;
                        case "SNAP_HORAS":
                            if (self.opciones && self.opciones["SNAP_HORAS"]) {
                                sch.options.snap = self.opciones["SNAP_HORAS"].valor;
                            }
                            break;
                        case "TIEMPO_PREPARACION_COLOR":
                            $(".tiempoPreparacionWO").each(function (idx, elem) {
                                let tColor = "";
                                if ($(this).hasClass("prepArranque")) {
                                    tColor = self.opciones["TIEMPO_PREPARACION_COLOR"].valor["ARRANQUE"];
                                }
                                else if ($(this).hasClass("prepCambio")){
                                    tColor = self.opciones["TIEMPO_PREPARACION_COLOR"].valor["CAMBIO"];
                                }
                                else {
                                    tColor = self.opciones["TIEMPO_PREPARACION_COLOR"].valor["MANUAL"];
                                }

                                $(this).css({
                                    "background-color": tColor,
                                    "color": ColorTextoBlancoNegro(tColor)
                                })

                            });
                            break;
                        case "LINEAS_COLOR":

                            // Actualizamos los colores de las lineas locales
                            let nuevosColores = self.opciones["LINEAS_COLOR"].valor;
                            for (let l of self.datosMES.lineas) {
                                l.color = nuevosColores[l.numLinea];
                            }

                            // Actualizamos los colores en los recursos del scheduler
                            sch.resources.find(f => f.field == "idLinea").dataSource.data(self.datosMES.lineas);
                            sch.view(sch.view().name);

                            break;
                        //case "HORAS_TIEMPO_INICIAL":
                        //    sch.view(sch.view().name);
                        //    break;
                        default:

                    }
                }                
            },
            LimpiarFiltros: function () {
                let self = this;

                if (self.grid) {
                    self.grid.dataSource.filter({
                        "logic": "and",
                        "filters": [
                            {
                                "field": "visibleEnGrid",
                                "operator": "eq",
                                "value": true
                            }
                        ]
                    });
                }
            },
            events: {
                "click #btnCargar": 'CargarPlanificador',
                "click #btnGuardarPlanificacion": 'GuardarPlanificacion',
                "click #btnExportarBorrador": 'ModalExportarBorrador',
                "click #btnExportarPlanificacion": 'ModalExportarPlanificacion',
                "click #btnCrearWO": 'ModalCrearWO',
                'click #btnLimpiarFiltros': 'LimpiarFiltros',
                'click #btnConfiguracion': 'ModalConfiguracion',
            },
            eliminar: function () {
                Backbone.off('expSecuenciadorIniciada');
                Backbone.off('expSecuenciadorProgreso');
                Backbone.off('expSecuenciadorFinalizada');

                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resize: function () {
                let self = window.app.vista;

                if (self.sch) {
                    self.sch.refresh();
                }
            },
            actualiza: function (e) {
                var self = this;

            },
            conversorMinutosDuracion: function (minutos) {
                let horas = parseInt(minutos / 60);
                let mins = minutos - (horas * 60);

                return kendo.format("{0:00}:{1:00}", horas, mins);
            },
            conversorDuracionMinutos: function (duracion) {
                let [horas, mins] = duracion.split(":").map(m => parseInt(m.slice(0, 2).replace(/_/g, "0")))

                return horas * 60 + mins;
            }
        })

        return planificadorWO;
    })