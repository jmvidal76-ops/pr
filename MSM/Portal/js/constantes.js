define([], function () {
    return {
        OperacionesAlmacen: function () {
            var Info = {
                OPERACIONES: "0",
                AJUSTAR_CANTIDAD: "1",
                PRIORIDAD: "2",
                CUARENTENA: "3",
                BLOQUEAR: "4",
                MOVER: "5",
                CREAR_LOTE_2: "7",
                ELIMINAR_LOTE: "8",
                DEFECTUOSO: "9",
                CADUCIDAD: "11",
                EDITAR_LOTE: "24",
                EDITAR_PROPIEDADES_LOTE: "25"
            }
            return Info;
        },

        IdTipoUbicacion: function () {
            var Info = {
                Recepcion: 1,
                Almacenamiento: 2,
                Almacenamiento_consumo: 3,
                Consumo: 4,
                Preparacion: 5,
                Virtual: 6,
                Carga: 7,
                Descarga: 8,
                Producción_Consumo: 9,
                Producción: 10,
                UbicacionLogica: 11
            }
            return Info;
        },

        IdEstadoWO: function () {
            var Info = {
                Planificada: 1,
                Producción: 2,
                Consolidando_datos: 3,
                Cerrada: 4
            }
            return Info;
        },
        TipoWO: function () {
            var Info = {
                Coccion: 1,
                Fermentacion: 2,
                Trasiego: 3,
                Guarda: 4,
                Filtracion: 5,
                Prellenado: 6,
                Concentrado: 7
            }
            return Info;
        },
        AbreviaciónTipoWO: function () {
            var Info = {
                1: "COC",
                2: "FER",
                3: "TRA",
                4: "GUA",
                5: "FIL",
                6: "PRE"
            }
            return Info;
        },
        EstadoKOP: function () {
            var Info = {
                Inexistente: 1,
                Malo: 2,
                Bueno: 3
            }
            return Info;
        },
        EstadoColor: function () {
            var Info = {
                Azul: 1,
                Amarillo: 2,
                Verde: 3
            }            
            return Info;
        },
        TipoDisparadorConsumoMMPP: function () {
            var Info = {
                KOP: 1,
                Transferencia: 2
            }
            return Info;
        },

        PoliticaVaciado: function () {
            var Info = {
                FIFO: 1,
                LIFO: 2,
                FEFO: 3,
                LOTEWO: 4,
                LOTEUNICO: 5,
                SINPOLITICA: 6
            }
            return Info;
        },

        ModoDescuentoConsumoMMPP: function () {
            var Info = {
                Teorica: 1,
                Real: 2,
                TeoricaSemielaborado: 3
            }
            return Info;
        },

        TipoParametrosO2: function () {
            var Info = {
                PresionVacio: 0,
                PresionEspumado: 1,
                PresionSoplado: 2,
                ConsumoGas: 3
            }
            return Info;
        },
        ProcesoLote: function () {
            var Info = {
                ENV: 1,
                FAB: 2,
                REC: 3,
                COC: 4,
                FER: 5,
                GUA: 6,
                TCP: 7,
                FIL: 8
            }
            return Info;
        },
        ProcesoLoteString: function () {
            var Info = {
                Envasado: "ENV",
                Fabricacion: "FAB",
                Recepcion: "REC",
                Coccion: "COC",
                Fermentacion: "FER",
                Guarda: "GUA",
                Prellenado: "TCP",
            }
            return Info;
        },
        ValidarNumeroCreacionManualWO: function () {
            var Info = {
                VALOR_NO_EXISTENTE: 0,
                VALOR_MAXIMO: 1,
                VALOR_EXISTENTE: 2,
                ERROR: 3,
            }
            return Info;
        },

        EstadosSolicitudMantenimiento: function () {
            var Info = {
                Cerrada: "M5",
                CerradaYSincronizadaJDE: "M6"
            }
            return Info;
        },

        OperacionesSolicitudMantenimiento: function () {
            var Info = {
                Crear: 0,
                Editar: 1,
                Cerrar: 2,
                AsociarParo: 3
            }
            return Info;
        },

        PantallasVideowall: function () {
            var Info = {
                Fecha: 1,
                DiaJuliano: 2,
                CuadroMandoLinea: 3,
                OEE: 4,
                WO: 5,
                Producto: 6,
                Accidente: 7,
                RendimientoTurnos: 8,
                OEEDiaMes: 9,
                FechaCaducidad: 10,
            }
            return Info;
        },
        ValidarNumeroBooleano: function () {
            var Info = {
                VALOR_NO_EXISTENTE: 0,
                VALOR_EXISTENTE: 1
            }
            return Info;
        },
        TipoWOPlanificado: function () {
            var Info = {
                Parametro: 0,
                Coccion: 1,
                Fermentacion: 2,
                Trasiego: 3,
                Guarda: 4,
                Filtracion: 5,
                Prellenado: 6,
                Concentrado: 7
            }
            return Info;
        },
        TipoMovimientoLote: function () {
            var Info = {
                Envasado: 1,
                Fabricacion: 2,
                Semielaborado: 3
            }
            return Info;
        },
        // Para añadir un nuevo menú con enlace externo, añadir su nombre de la tabla MENUS, con el id de la url de la tabla Enlaces Externos
        // Los ids del 8 en adelante no corresponden con entradas de menú
        EnlacesExternos: function () {
            var Info = {
                ACCESO_QLIK: 2,
                NOTIFICACION_ACCIDENTES: 3,
                NOTIFICACION_RIESGO: 4,
                PORTAL_SMART_OSH: 7,
                INSTRUCCIONES_TECNICAS_ENVASADO: 8,
                MANUAL_APPCC: 9,
                PLAN_VIGILANCIA: 10,
                GESTION_PRODUCTO_NO_CONFORME: 11,
                PROTOCOLOS_ENVASADO: 12,
                PLANES_HIGIENE: 13,
                ALBARANES_ENTRADA_CAMIONES: 14,
                MLEAN: 15,
                ARCHIVOS_ADJUNTOS_LOTE: 16,
                INSTRUCCIONES_QSA: 17,
                POLITICAS: 18,
                INSTRUCCIONES_TECNICAS_LABORATORIO: 19,
                METODOS_ANALITICOS: 20,
                MANUAL_APPCC_CALIDAD: 21,
                PLAN_VIGILANCIA_CALIDAD: 22,
                GESTION_PRODUCTO_NO_CONFORME_CALIDAD: 23,
                PROTOCOLOS_ENVASADO_CALIDAD: 24,
                PLANES_HIGIENE_CALIDAD: 25,
                INSTRUCCIONES_QSA_CALIDAD: 26,
                POLITICAS_CALIDAD: 27,
                INSTRUCCIONES_TECNICAS_FABRICACION: 28,
                MANUAL_APPCC_FABRICACION: 29,
                PLAN_VIGILANCIA_FABRICACION: 30,
                GESTION_PRODUCTO_NO_CONFORME_FABRICACION: 31,
                PLANES_HIGIENE_FABRICACION: 32,
                INSTRUCCIONES_QSA_FABRICACION: 33,
                POLITICAS_FABRICACION: 34,
                NOTIFICACION_COMPORTAMIENTOS: 37
            }
            return Info;
        },

        TransferenciaSIGI: function () {
            var Info = {
                Manual: 1,
                Automatica: 2,
            }
            return Info;
        },

        TipoTurnos: function () {
            var Info = {
                Mañana: 1,
                Tarde: 2,
                Noche: 3
            }
            return Info;
        },
        OperacionMovimientoLotes: function () {
            var Info = {
                Crear: 1,
                Editar: 2,
                Eliminar: 3,
                CrearTransferencia: 4
            }
            return Info;
        },
        TipoParametro: function () {
            var Info = {
                KOPs: 1,
                Mosto: 2
            }
            return Info;
        },
        TipoMaterial: function () {
            var Info = {
                Default: "00",
                Dummy: "Dummy",
                EnvaseEmbalaje: "02",
                MateriasPrimas: "01",
                ProductoTerminado: "03",
                Semielaborados: "71",
                Subproductos: "20"
            }
            return Info;
        },
        ClaseMaquina: function () {
            var Info = {
                LLE: "LLENADORA",
                IBV: "INSPECTOR_BOTELLAS_VACIAS",
                ETQ: "ETIQUETADORA_BOTELLAS",
                IBL: "INSPECTOR_BOTELLAS_LLENAS",
                BAS: "BASCULA",
                ISL: "INSPECTOR_SALIDA_LLENADORA"
                //LLENADORA: "LLENADORA",
                //INSPECTOR_BOTELLAS_VACIAS: "Inspector de vacío",
                //ETIQUETADORA_BOTELLAS: "Etiquetadora",
            }
            return Info;
        },

        OperacionesCRUD: function () {
            var Info = {
                Crear: 0,
                Editar: 1,
                Eliminar: 2
            }
            return Info;
        },

        ClaseEnvase: function () {
            var Info = {
                LLE: "Lleno",
                VAC: "Vacío"
            }
            return Info;
        },

        IdEstadoOrdenProgramado: function () {
            var Info = {
                Real: 0,
                Planificada: 1
            }
            return Info;
        },

        ModoVista: function () {
            var Info = {
                Tabla: 0,
                Grafico: 1
            }
            return Info;
        },

        ConfigPreparacionPlanificador: function () {
            var Info = {
                Automatico: 0,
                Semiautomatico: 1,
                Manual: 2
            }
            return Info;
        },

        TipoPreparacionPlanificador: function () {
            var Info = {
                Arranque: 0,
                Cambio: 1,
                Manual: 2
            }
            return Info;
        },

        UnidadDeMedida: function () {
            var Info = {
                Palet: "PL",
                MedioDisplay: "MD"
            }
            return Info;
        },

        TipoVistaPlanificador: function () {
            var Info = {
                DIA: {
                    key: 1,
                    value: "timeline"
                },
                SEMANA: {
                    key: 2,
                    value: "timelineWeek"
                },
                MES: {
                    key: 3,
                    value: "timelineMonth"
                }
            }
            return Info;
        },

        CandadoEditorPlanificador: function () {
            var Info = {
                FECHA_FIN: 1,
                CANTIDAD: 2
            }
            return Info;
        },

        ModoFechasPlanificador: function () {
            var Info = {
                Auto: 0,
                SemiAuto: 1,
                Manual: 2
            }
            return Info;
        },

        OrigenWO: function () {
            var Info = {
                JDE: "J",
                MES: "S",
                MANUAL: "M"
            }
            return Info;
        },

        EstadosWOPlanificador: function () {
            var Info = {
                DescargadaJDE: 1,
                Planificada: 2,
                EnProduccion: 3,
                Producida: 4,
                Cancelada: 5
            }
            return Info;
        },

        EditorWOInput: function () {
            var Info = {
                HoraInicio: 0,
                HoraInicioWO: 1,
                HoraFin: 2,
                DuracionPreparacion: 3,
                TipoPreparacion: 4,
                AutoAjuste: 5,
                CantidadPalets: 6,
                CantidadCajas: 7,
                CantidadHectolitros: 8,
                Linea: 9,
                VelocidadNominal: 10,
                OEE: 11,
            }
            return Info;
        },
        ClaseUbicacion: function () {
            var Info = {
                Cerveza: "CZA",
                CervezaAltaDensidad: "CZH",
                CervezaFiltrada: "CZAF",
                CervezaEnvasada: "CZAE",
                CervezaPrellenado: "CZAP",
                CervezaRecuperada: "CZAR",
                CervezaEnvasadaBotellaLata: "CZAEB",
                CervezaEnvasadaBarril: "CZAEK"
            }
            return Info;
        },
        TipoParo: function () {
            var Info = {
                ParoMayor: 1,
                PerdidaProduccion: 2
            }
            return Info;
        },
        EstadoFormularioCalidad: function () {
            var Info = {
                Pendiente: 0,
                Finalizado: 1,
                NoValido: 2
            }
            return Info;
        },
        EstadosMensajesSAI: function () {
            var Info = {
                NoProcesado: 0,
                Procesado: 1,
                Fallido: 2,
                SinProcesarNoMotivo: 3
            }
            return Info;
        },
        EstadoProducciones: function () {
            var Info = {
                EnEspera: {
                    value: "EN ESPERA"
                },
                CorrectaMESJDE: {
                    value: "CORRECTA MES Y JDE"
                },
                HabilitadaMES: {
                    value: "HABILITADA MES"
                },
                ImportadaMES: {
                    value: "IMPORTADA MES"
                },
                AnuladaMES: {
                    value: "ANULADA MES"
                },
                EliminadaJDE: {
                    value: "ELIMINADA JDE"
                }
            }
            return Info;
        },
        MaestroTipoLoteManualSemielaborados: function () {
            var Info = {
                Coccion: { Id: 1, IdTipoZona: 2 },
                Fermentacion: { Id: 2, IdTipoZona: 3 },
                Guarda: { Id: 3, IdTipoZona: 3 },
                TCP: { Id: 4, IdTipoZona: 6 },
                LevaduraColeccion: { Id: 7, IdTipoZona: 7 },
                LevaduraPropagacion: { Id: 8, IdTipoZona: 7 },
                MateriasPrimas: { Id: -1, IdTipoZona: 0 },
            }
            return Info;
        },
        ProcesoLoteFullNames: function () {
            var Info = {
                GeneralFabricacion: 2,
                Recepcion: 3,
                Coccion: 4,
                Fermentacion: 5,
                Guarda: 6,
                Prellenado: 7,
                Filtracion: 8
            }

            return Info;
        },
        ClaseMaterialTM: function () {
            var Info = {
                Mostos: {
                    id: "71",
                    desc: "MOS"
                    },
                Cerveza: {
                    id: "03",
                    desc: "CER"
                },
                Subproducto: {
                    id: "20",
                    desc: "SUB"
                }
            }

            return Info;
        },
        UnidadMedida: function () {
            var Info = {
                Hectolitros: 'HL',
                Kilogramos: 'kg'
            }

            return Info;
        },
        AccionCamiones: function () {
            var Info = {
                Entrada: 1,
                Salida: 2,
                Editar: 3,
                Historico: 4,
                Ver: 5,
                FacturacionEditar: 6,
                FacturacionVer: 7
            }

            return Info;
        },
        TipoOperacionCamiones: function () {
            var Info = {
                Carga: 1,
                Descarga: 2
            }

            return Info;
        },
        MantenimientoFormulario: function () {
            var Info = {
                TRANSPORTISTA: {
                    uri: "Driver",
                    key: "TRANSPORTISTA"
                },
                PROVEEDOR: {
                    uri: "Provider",
                    key: "PROVEEDOR"
                },
                CLIENTE: {
                    uri: "Client",
                    key: "CLIENTE"
                },
                PRODUCTO: {
                    uri: "Product",
                    key: "PRODUCTO"
                },
                DESTINATARIO: {
                    uri: "Adressee",
                    key: "DESTINATARIO"
                },
                OPERADOR: {
                    uri: "Operator",
                    key: "OPERADOR"
                },
                MATRICULA_TRACTORA: {
                    uri: "RegistrationT",
                    key: "MATRICULA_TRACTORA"
                },
                MATRICULA_REMOLQUE: {
                    uri: "RegistrationR",
                    key: "MATRICULA_REMOLQUE"
                },
                ORIGEN_MERCANCIA: {
                    uri: "Origin",
                    key: "ORIGEN_MERCANCIA"
                },
            }

            return Info
        },
        MetricasRealTime: function () {
            var Info = {
                Bascula: "/VARIOS_FABRICA/BASCULAS/BASCULA_CAMION_01_PESO",
            }

            return Info;
        },
        IdMaestroOrigen: function () {
            var Info = {
                MES: 1,
                AVANADE: 2,
                JDE: 3,
            }

            return Info;
        },
        ColoresSemaforo: function () {
            const Info = {
                VERDE: 1,
                VERDE_OSCURO: 2,
                AZUL: 3,
                AMARILLO: 4,
                GRIS: 5,
                NARANJA: 6,
                ROJO: 7
            }

            return Info;
        },
        EstadosHistoricoOrdenes: function () {
            const Info = {
                Creada: 'Creada',
                Iniciando: 'Iniciando',
                Produccion: 'Producción',
                Pausada: 'Pausada',
                Finalizada: 'Finalizada',
                Cerrada: 'Cerrada'
            }

            return Info;
        },
        TipoDatoEnvioJDE: function () {
            var Info = {
                COCCION: 0,
                CONSUMO_MMPP_COCCION: 1,
                TCP: 2,
                CONSUMO_MMPP_TCP: 3
            }

            return Info;
        },
        TipoEstadoFacturacion: function () {
            var Info = {
                VALIDO: 1,
                NO_VALIDO: 2,
                FACTURADO: 3
            }

            return Info;
        },
        TipoEnvaseCerveza: function () {
            var Info = {
                CZAP: "Cerveza (CZAP)",
                CZAPB: "Cerveza botella/lata (CZAPB)",
                CZAPK: "Cerveza barril (CZAPK)"
            }

            return Info;
        }
    }
})