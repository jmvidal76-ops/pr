define(['underscore', 'backbone', 'jquery', 'vistas/envasado/vRelevoTurnoOficiales', 'text!../../../html/envasado/RelevoTurnoOficiales.html', 'compartido/notificaciones',
    '../../../../scripts/utils'],
    function (_, Backbone, $, RelevoTurnoOficiales, PlantillaRelevoTurnoOficiales, Not, utils) {
        var RelevoTurnoOficiales = Backbone.View.extend({
            tiposTurno: [],
            requests: [],
            idLinea: null,
            numLinea: null,
            idZona: null,
            fechaInicial: null,
            turnoInicial: null,
            turnoSiguiente: null,
            consolidadoTurnoActual: null,
            consolidadoTurnoAnterior: null,
            consolidadoTurnoAmterior2: null,
            turnoActualId: null,
            turnoAnteriorId: null,
            turnoAnterior2Id: null,
            tipoTurno: null,
            turnoActualRelevo: null,
            turnoAnteriorRelevo: null,
            turnoAnterior2Relevo: null,

            template: _.template(PlantillaRelevoTurnoOficiales),
            initialize: function (options) {

                var self = this;

                self.cargarTiposTurno();

                self.cargaDatosInicial();
                self.render();

                // Iniciar temporizador de auto-actualización
                self.IniciarActualizacionAutomatica();

                //Detecta evento de cambio de puesto en cualquier pestaña
                Backbone.on('eventCambioPuestoGlobal', (data) => {
                    if (window.app.sesion.attributes.usuarioId == data.sesion.usuarioId) {  //Comprobamos si es el mismo usuario
                        //Actualiza datos de window.app 
                        window.app.sesion.attributes = data.sesion;
                        window.app.vistaPrincipal.actualizaLineaZona();
                        window.app.vistaPrincipal.actualizaPie();

                        self.actualiza();
                    }
                }, this);

            },
            IniciarActualizacionAutomatica: function () {
                var self = this;

                self.tiempoInactividad = 10 * 1000; // 10 segundos
                self.tiempoEspera = 1 * 60 * 1000;  // 1 minuto
                self.temporizadorInactividad = null;
                self.temporizadorActualizacion = null;
                self.modoAutoActualizando = false;
                self.notaPendiente = false;

                function reiniciarTemporizadores() {
                    clearTimeout(self.temporizadorInactividad);
                    clearInterval(self.temporizadorActualizacion);
                    self.modoAutoActualizando = false;

                    // Si hay nota pendiente, NO programar nada
                    if (self.notaPendiente) return;

                    self.temporizadorInactividad = setTimeout(function () {
                        // Volvemos a comprobar antes de arrancar
                        if (!self.notaPendiente) {
                            self.modoAutoActualizando = true;
                            self.temporizadorActualizacion = setInterval(function () {
                                if (!self.notaPendiente) {
                                    self.actualiza();
                                }
                            }, self.tiempoEspera);
                        }
                    }, self.tiempoInactividad);
                }

                // Eventos de actividad general
                $(document).on('mousemove keydown click scroll', reiniciarTemporizadores);

                // Detectar que el usuario modificó la nota del turno
                $(document).on('input', '#TurnoActual', function () {
                    if ($(this).val().trim() !== '') {
                        self.notaPendiente = true;
                        clearTimeout(self.temporizadorInactividad);
                        clearInterval(self.temporizadorActualizacion);
                    } else {
                        self.notaPendiente = false;
                        reiniciarTemporizadores();
                    }
                });

                reiniciarTemporizadores();
            },
            cargaDatosInicial: async function () {
                let self = this;

                self.idLinea = window.app.lineaSel.id;
                self.numLinea = window.app.lineaSel.numLinea
                self.idZona = window.app.zonaSel.id;

                //Obtenemos tipo turno
                let fecha = new Date();

                //Hora para probar comportamiento
                //fecha = new Date(2025, 5, 17, 00, 30, 0, 0); 


                self.fechaInicial = fecha;
                self.tipoTurno = self.getTipoTurno(fecha);

                // Si no se pudo determinar el tipo de turno, no podemos continuar
                if (self.tipoTurno === null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), 'No se pudo determinar el tipo de turno actual. Revise la configuración.', 4000);
                    kendo.ui.progress($("#panelDatos"), false);
                    return;
                }

                //Obtenemos idConsolidadoTurno Actual
                self.consolidadoTurnoActual = await self.obtenerConsolidadoTurno(self.idLinea, fecha, self.tipoTurno);

                //Si es null, es porque el turno actual pertenece a la noche del dia anterior
                if (self.consolidadoTurnoActual == null) {
                    let fechaAyer = new Date(fecha);
                    fechaAyer.setDate(fechaAyer.getDate() - 1);
                    self.consolidadoTurnoActual = await self.obtenerConsolidadoTurno(self.idLinea, fechaAyer, self.tipoTurno);
                    if (self.consolidadoTurnoActual == null) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), 'Error obteniendo consolidadoTurnoActual', 4000);
                        kendo.ui.progress($("#panelDatos"), false);
                        return; // Salir si no se pudo obtener el turno actual
                    }
                }
                self.turnoInicial = self.consolidadoTurnoActual;
                self.turnoActualId = self.consolidadoTurnoActual?.IdConsolidadoTurno || null;

                //Pasamos a cargar el turnos
                await self.cargaDatosTurnos();

            },
            cargarTiposTurno: function () {
                let self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/tiposTurnosFabrica/",
                    dataType: 'json',
                    cache: true,
                    async: false
                }).done(function (data) {
                    self.tiposTurno = data.filter(function (item) {
                        return item.id > 0 && item.id <= 3;
                    });
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TIPOS_TURNO'), 4000);
                    }
                    self.tiposTurno = []; // Asegurar que sea un array vacío si falla
                });
            },
            cargaDatosTurnos: async function () {
                let self = this;

                kendo.ui.progress($("#panelDatos"), true);

                self.turnoActualId = self.consolidadoTurnoActual?.IdConsolidadoTurno || null;

                // Cargar turno siguiente
                await self.cargarTurnoSiguiente();

                // Cargar turno anterior
                await self.cargarTurnoAnterior();
                self.turnoAnteriorId = self.consolidadoTurnoAnterior?.IdConsolidadoTurno || null;

                // Cargar turno anterior 2
                await self.cargarTurnoAnterior2();
                self.turnoAnterior2Id = self.consolidadoTurnoAnterior2?.IdConsolidadoTurno || null;

                //CARGAMOS DATOS DE RELEVOS TURNO OFICIALES
                self.turnoActualRelevo = await self.cargaDatosRelevo(self.turnoActualId, self.idZona);
                self.turnoAnteriorRelevo = await self.cargaDatosRelevo(self.turnoAnteriorId, self.idZona);
                self.turnoAnterior2Relevo = await self.cargaDatosRelevo(self.turnoAnterior2Id, self.idZona);

                // Solo actualizar los controles si consolidadoTurnoActual no es nulo
                if (self.consolidadoTurnoActual) {
                    self.$("#fechaFiltro").data("kendoDatePicker").value(self.consolidadoTurnoActual.FechaTurno);
                    self.$("#ddlTurno").data("kendoDropDownList").value(self.consolidadoTurnoActual.IdTipoTurno);
                }

                //Mostramos datos
                self.mostrarDatosRelevo();
            },
            cargarTurnoSiguiente: async function () {
                let self = this;
                if (!self.consolidadoTurnoActual) {
                    self.turnoSiguiente = null;
                    return;
                }
                let dtNext = new Date(self.consolidadoTurnoActual.FechaTurno);
                let tipoTurnoNext = self.consolidadoTurnoActual.IdTipoTurno + 1;
                if (tipoTurnoNext == 4) {
                    tipoTurnoNext = 1;
                    dtNext._addDays(1);
                }

                if (self.consolidadoTurnoActual?.IdConsolidadoTurno == self.turnoInicial?.IdConsolidadoTurno) {
                    self.turnoSiguiente = null;
                } else {
                    self.turnoSiguiente = await self.obtenerConsolidadoTurno(self.idLinea, dtNext, tipoTurnoNext);
                }
            },
            cargarTurnoAnterior: async function () {
                let self = this;
                if (!self.consolidadoTurnoActual) {
                    self.consolidadoTurnoAnterior = null;
                    return;
                }
                var fecha = new Date(self.consolidadoTurnoActual.FechaTurno);
                var tipoTurnoAnterior = self.consolidadoTurnoActual.IdTipoTurno - 1;
                if (tipoTurnoAnterior == 0) {
                    tipoTurnoAnterior = 3;
                    fecha._addDays(-1);
                }
                self.consolidadoTurnoAnterior = await self.obtenerConsolidadoTurno(self.idLinea, fecha, tipoTurnoAnterior);
            },
            cargarTurnoAnterior2: async function () {
                let self = this;
                if (!self.consolidadoTurnoAnterior) { // Depende de que el turno anterior exista
                    self.consolidadoTurnoAnterior2 = null;
                    return;
                }
                var fecha2 = new Date(self.consolidadoTurnoAnterior.FechaTurno);
                var tipoTurnoAnterior2 = self.consolidadoTurnoAnterior.IdTipoTurno - 1;
                if (tipoTurnoAnterior2 == 0) {
                    tipoTurnoAnterior2 = 3;
                    fecha2._addDays(-1);
                }
                self.consolidadoTurnoAnterior2 = await self.obtenerConsolidadoTurno(self.idLinea, fecha2, tipoTurnoAnterior2);
            },
            obtenerConsolidadoTurno: async function (idLinea, fecha, idTipoTurno) {
                return new Promise((resolve, reject) => {
                    if (idTipoTurno === null || idTipoTurno === undefined) {
                        console.warn("obtenerConsolidadoTurno: idTipoTurno es nulo/indefinido. No se realizará la llamada a la API.");
                        return resolve(null); // Resuelve con null para que el await no falle
                    }

                    // Construcción de los datos
                    let datos = {
                        linea: idLinea,
                        fecha: fecha.toISOString(),
                        idTipoTurno: idTipoTurno
                    };

                    // Realización de la solicitud AJAX
                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerConsolidadoTurno",
                        dataType: 'json',
                        data: datos,
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TURNOS'), 4000);
                            }
                            reject(null);
                        }
                    });
                });
            },
            cargaDatosRelevo: async function (idConsolidadoTurno, idZona) {
                return new Promise((resolve, reject) => {
                    if (idConsolidadoTurno === null || idConsolidadoTurno === undefined) {
                        console.warn("cargaDatosRelevo: idConsolidadoTurno es nulo/indefinido. No se realizará la llamada a la API.");
                        return resolve(null); // Resuelve con null para que el await no falle
                    }

                    let datos = {
                        idConsolidadoTurno: idConsolidadoTurno,
                        idZona: idZona
                    }

                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerRelevoTurnoOficiales",
                        dataType: 'json',
                        data: datos,
                        contentType: "application/json; charset=utf-8",
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_RELEVO'), 4000);
                            }
                            reject(null);
                        }
                    })
                });
            },
            cambiarFechaYTipoTurno: function (fecha, tipoTurno) {
                let self = this;

                if (!tipoTurno) {
                    tipoTurno = self.getTipoTurno(fecha)
                }

                if (tipoTurno == 3 && fecha.getHours < 12) {
                    fecha._addDays(-1)
                }

                self.tipoTurno = tipoTurno

                self.$("#fechaFiltro").data("kendoDatePicker").value(fecha.midday());
                self.$("#ddlTurno").data("kendoDropDownList").value(self.tipoTurno);

            },
            mostrarDatosRelevo: function () {
                let self = this;

                kendo.ui.progress($("#panelDatos"), false);

                // Función para formatear la fecha
                function formatFecha(fecha) {
                    let date = new Date(fecha);
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('es-ES');
                    }
                    return ""; // Si la fecha es inválida
                }

                // TURNO ANTERIOR 2
                $("#fechaAnt2").text(formatFecha(self.turnoAnterior2Relevo?.FechaTurno) || "");
                $("#tipoTurnoAnt2").text(self.tiposTurno.find(item => item.id === self.turnoAnterior2Relevo?.IdTipoTurno)?.nombre || "");
                $("#empleadoAnt2").val(self.turnoAnterior2Relevo?.Oficial || "");
                $("#TurnoAnterior2").val(self.turnoAnterior2Relevo?.Notas || "");

                // TURNO ANTERIOR
                $("#fechaAnt").text(formatFecha(self.turnoAnteriorRelevo?.FechaTurno) || "");
                $("#tipoTurnoAnt").text(self.tiposTurno.find(item => item.id === self.turnoAnteriorRelevo?.IdTipoTurno)?.nombre || "");
                $("#empleadoAnt").val(self.turnoAnteriorRelevo?.Oficial || "");
                $("#TurnoAnterior").val(self.turnoAnteriorRelevo?.Notas || "");

                // TURNO ACTUAL
                $("#fechaAct").text(formatFecha(self.turnoActualRelevo?.FechaTurno) || "");
                $("#tipoTurnoAct").text(self.tiposTurno.find(item => item.id === self.turnoActualRelevo?.IdTipoTurno)?.nombre || "");
                $("#empleadoAct").val(self.turnoActualRelevo?.Oficial || "");
                $("#TurnoActual").val(self.turnoActualRelevo?.Notas || "");

                let esTurnoInicial = false;
                // Más robusto: asegurar que ambos objetos existen antes de comparar IDs
                if (self.consolidadoTurnoActual && self.turnoInicial &&
                    self.consolidadoTurnoActual.IdConsolidadoTurno === self.turnoInicial.IdConsolidadoTurno) {
                    esTurnoInicial = true;
                }

                var permiso = TienePermiso(376);

                // Reinicializar el estado de los campos de entrada
                document.getElementById("empleadoAct").disabled = true;
                document.getElementById("TurnoActual").disabled = true;
                document.getElementById("turno-actual").style.backgroundColor = "#ededed";
                document.getElementById("empleadoAct").style.backgroundColor = "#ededed";
                document.getElementById("btnActualizarRelevo").style.display = "none";
                document.getElementById("DatosNoPlanificado").style.display = "none"; // Por defecto oculto
                document.getElementById("DatosPlanificado").style.display = "none"; // Por defecto oculto
                document.getElementById("TurnoActual").style.display = "block"; // Asegurar que el campo de notas siempre sea visible si se va a interactuar con él

                if (esTurnoInicial && permiso) {
                    // Es el turno actual y el usuario tiene permiso
                    if (self.turnoActualRelevo?.IdTurno != 0) {
                        // El turno está planificado/activo
                        document.getElementById("empleadoAct").disabled = false;
                        document.getElementById("TurnoActual").disabled = false;
                        document.getElementById("turno-actual").style.backgroundColor = "#ffffff";
                        document.getElementById("empleadoAct").style.backgroundColor = "#ffffff";
                        document.getElementById("btnActualizarRelevo").style.display = "block";
                        document.getElementById("DatosPlanificado").style.display = "block";
                        document.getElementById("btnActivarRelevo").style.display = "none"; // Ocultar activar si ya está planificado
                    } else {
                        // El turno NO está planificado (IdTurno es 0), pero es el turno actual
                        document.getElementById("empleadoAct").disabled = true; // No se puede editar hasta activar
                        document.getElementById("TurnoActual").disabled = true; // No se puede editar hasta activar
                        document.getElementById("turno-actual").style.backgroundColor = "#e4e4e4"; // Color para no planificado
                        document.getElementById("empleadoAct").style.backgroundColor = "#e4e4e4";
                        document.getElementById("btnActualizarRelevo").style.display = "none"; // No se puede actualizar si no está activo
                        document.getElementById("DatosNoPlanificado").style.display = "block"; // Mostrar mensaje de no planificado
                        document.getElementById("btnActivarRelevo").style.display = "block"; // Mostrar activar si no está planificado
                    }
                } else {
                    // No es el turno inicial (es un turno pasado/futuro) o el usuario no tiene permiso
                    // Los campos ya están deshabilitados por la inicialización.
                    document.getElementById("turno-actual").style.backgroundColor = "#ededed"; // Mantener color deshabilitado
                    document.getElementById("empleadoAct").style.backgroundColor = "#ededed";
                    document.getElementById("btnActivarRelevo").style.display = "none"; // Ocultar activar si no es el turno inicial o no hay permiso
                    // No se muestran botones de actualizar/activar para turnos que no son el actual o sin permiso.
                }
            },
            actualizarRelevoTurnoOficiales: async function (e) {
                let self = this;

                const notas = $('#TurnoActual').val();
                const oficial = $('#empleadoAct').val();

                if (!notas) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMULARIO_CAMPO_OBLIGATORIO').replace("#CAMPO", window.app.idioma.t('NOTAS')), 4000);
                    return;
                }
                if (!oficial) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMULARIO_CAMPO_OBLIGATORIO').replace("#CAMPO", window.app.idioma.t('EMPLEADO')), 4000);
                    return;
                }

                if (notas || oficial) {
                    await self.llamarActualizarRelevo(notas, oficial);

                    // Una vez guardado, ya no hay nota pendiente
                    self.notaPendiente = false;
                    self.IniciarActualizacionAutomatica();
                }
            },
            llamarActualizarRelevo: async function (notas, oficial) {
                let self = this;

                kendo.ui.progress($("#panelDatos"), true);

                return new Promise((resolve, reject) => {
                    if (!self.consolidadoTurnoActual) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'No hay turno actual consolidado para actualizar.', 4000);
                        kendo.ui.progress($("#panelDatos"), false);
                        return reject(null);
                    }
                    let datos = {
                        idConsolidadoTurno: self.consolidadoTurnoActual.IdConsolidadoTurno,
                        idLinea: self.idLinea,
                        idZona: self.idZona,
                        notas: notas,
                        oficial: oficial,
                        IdTipoTurno: self.consolidadoTurnoActual.IdTipoTurno,
                        InicioTurno: self.consolidadoTurnoActual.InicioTurno
                    }

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
            activarRelevoTurnoOficiales: async function () {
                let self = this;

                kendo.ui.progress($("#panelDatos"), true);

                return new Promise((resolve, reject) => {
                    if (!self.consolidadoTurnoActual) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'No hay turno actual consolidado para activar.', 4000);
                        kendo.ui.progress($("#panelDatos"), false);
                        return reject(null);
                    }
                    let datos = {
                        idConsolidadoTurno: self.consolidadoTurnoActual.IdConsolidadoTurno,
                        idZona: self.idZona
                    }

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
                                if (self.turnoActualRelevo) {
                                    self.turnoActualRelevo.IdTurno = 1;
                                }
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
            events: {
                "click #btnTurnoActual": "irTurnoActual",
                "click #btnTurnoAtras": "moverTurnoAtras",
                "click #btnTurnoAdelante": "moverTurnoAdelante",
                "change #fechaFiltro": "turnoSeleccionado",
                "change #ddlTurno": 'turnoSeleccionado',
                "click #btnActualizarRelevo": "actualizarRelevoTurnoOficiales",
                "click #btnActivarRelevo": "activarRelevoTurnoOficiales",
            },
            actualiza: function () {
                let self = window.app.vista;

                self.cargaDatosInicial();

                self.render();
            },
            getTipoTurno: function (fecha) {
                var self = this;
                var tipoTurno = null;
                //var turno = window.app?.planta?.turnoActual?.[window.app.lineaSel?.numLinea - 1];
                //if (turno && turno.turnoProductivo) {
                //    tipoTurno = turno.tipo.id;
                //} else {
                    var tTurno = self.getTipoTurnoFecha(fecha);
                    if (tTurno !== null) {
                        tipoTurno = tTurno;
                    }
                //}

                return tipoTurno;
            },
            getTipoTurnoFecha: function (fecha) {
                var self = this;

                if (!self.tiposTurno || self.tiposTurno.length === 0) {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), 'No se pudieron cargar los tipos de turno necesarios.', 4000);
                    return null;
                }

                let currentMinutes = fecha.getHours() * 60 + fecha.getMinutes();

                let result = 1; // Default to 1 (morning)

                for (let tt of self.tiposTurno) {
                    // Crea un objeto Date temporal para parsear la hora y los minutos
                    // Asegúrate de que tt.inicio y tt.fin son cadenas que Date puede parsear
                    let tempStartDate = new Date(tt.inicio);
                    let tempEndDate = new Date(tt.fin);

                    let startInMinutes = tempStartDate.getHours() * 60 + tempStartDate.getMinutes();
                    let endInMinutes = tempEndDate.getHours() * 60 + tempEndDate.getMinutes();

                    // Manejar turnos que cruzan la medianoche
                    if (startInMinutes > endInMinutes) {
                        // El turno cruza la medianoche (ej: Noche 22:00-06:00)
                        // Si la hora actual es mayor o igual que el inicio (del mismo día) O
                        // Si la hora actual es menor que el fin (del día siguiente)
                        if (currentMinutes >= startInMinutes || currentMinutes < endInMinutes) {
                            result = tt.id;
                            break;
                        }
                    } else {
                        // El turno está dentro del mismo día (ej: Mañana 06:00-14:00, Tarde 14:00-22:00)
                        if (currentMinutes >= startInMinutes && currentMinutes < endInMinutes) {
                            result = tt.id;
                            break;
                        }
                    }
                }
                return result;
            },
            obtenerFechaFiltros: function (inicio = true) {
                let self = this;

                let dt = self.$("#fechaFiltro").data("kendoDatePicker").value();
                let tipoTurno = Number(self.$("#ddlTurno").data("kendoDropDownList").value());

                if (!dt) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FECHA_INCORRECTA'), 3000);
                    return null
                }

                let tTurno = self.tiposTurno.find(f => f.id == tipoTurno);

                if (!tTurno) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), 'Tipo de turno no encontrado.', 3000);
                    return null;
                }

                let dateYear = dt.getFullYear();

                let time = new Date((inicio ? tTurno.inicio : tTurno.fin).replace("1899", dateYear)).getHours();

                dt = new Date(dt.setHours(time, 0, 0, 0));
                if (!inicio && tipoTurno == 3 && dt.getHours() > 0) {
                    dt._addDays(1);
                }

                return dt;

            },
            turnoSeleccionado: async function () {
                let self = this;

                let dt = self.$("#fechaFiltro").data("kendoDatePicker").value();
                let tipoTurno = Number(self.$("#ddlTurno").data("kendoDropDownList").value());

                if (!dt) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FECHA_INCORRECTA'), 3000);
                    return
                }
                kendo.ui.progress($("#panelDatos"), true);

                // Solo podemos movernos hacia atrás respecto al turno actual
                let actualDt = new Date();
                // Usa getTipoTurnoFecha para asegurar que actualTipoTurno se basa siempre en las reglas de tiempo
                let actualTipoTurno = self.getTipoTurnoFecha(actualDt);

                let dtSinHora = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
                let actualDtSinHora = new Date(actualDt.getFullYear(), actualDt.getMonth(), actualDt.getDate());

                // Se modifica la condición para una comparación robusta de fechas
                if ((dtSinHora.getTime() < actualDtSinHora.getTime()) || (dtSinHora.getTime() == actualDtSinHora.getTime() && tipoTurno <= actualTipoTurno)) {
                    try {
                        let fechaParaConsolidado = self.obtenerFechaFiltros(true);
                        if (!fechaParaConsolidado) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'Error al construir la fecha del turno seleccionado.', 4000);
                            kendo.ui.progress($("#panelDatos"), false);
                            return;
                        }

                        self.consolidadoTurnoActual = await self.obtenerConsolidadoTurno(self.idLinea, fechaParaConsolidado, tipoTurno);

                        self.cargaDatosTurnos();
                    }
                    catch (er) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TURNOS'), 4000);
                        kendo.ui.progress($("#panelDatos"), false);
                    }
                }
                else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_TURNO_FUTURO'), 4000);
                    kendo.ui.progress($("#panelDatos"), false);
                }
            },
            irTurnoActual: async function () {
                let self = this;

                self.consolidadoTurnoActual = self.turnoInicial;
                //this.cambiarFechaYTipoTurno(new Date(), turnoActual ? turnoActual.IdTipoTurno : null)
                await this.cargaDatosTurnos();
            },
            moverTurnoAtras: async function () {
                let self = this;

                kendo.ui.progress($("#panelDatos"), true);

                if (self.consolidadoTurnoAnterior) {
                    self.consolidadoTurnoActual = self.consolidadoTurnoAnterior;
                    //self.cambiarFechaYTipoTurno(new Date(turnoCargar.FechaTurno), turnoCargar.IdTipoTurno)
                    await self.cargaDatosTurnos();
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_TURNO_ANTERIOR_DISPONIBLE'), 4000);
                    kendo.ui.progress($("#panelDatos"), false);
                }
            },
            moverTurnoAdelante: async function () {
                let self = this;

                //Si el siguiente es el turno actual no carga nada
                if (self.turnoSiguiente) {
                    self.consolidadoTurnoActual = self.turnoSiguiente;

                    kendo.ui.progress($("#panelDatos"), true);

                    //self.cambiarFechaYTipoTurno(new Date(turnoCargar.Fecha), turnoCargar.IdTipoTurno)
                    await self.cargaDatosTurnos();
                }
                else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_TURNO_FUTURO'), 4000);
                }
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());

                self.$("#btnTurnoActual").kendoButton({ imageUrl: "img/time.png" });
                this.$('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");

                self.$("#fechaFiltro").kendoDatePicker({
                    value: new Date(),
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                self.$("#ddlTurno").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: self.tiposTurno,
                    value: self.tipoTurno
                });

                $("#center-pane").css("overflow", "hidden");
            },
            eliminar: function () {
                Backbone.off('eventCambioPuestoGlobal');

                $("#center-pane").css("overflow", "");

                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resizeGrid: function (grid) {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $(".cabeceraVista").innerHeight();
                var tblR = $("#tblResumen").innerHeight();
                var tblNav = $("#tableNav").innerHeight();

                var gridElement = $(grid),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - cabeceraHeight - tblR - tblNav - 163);//- otherElementsHeight 80
            }
        });
        return RelevoTurnoOficiales;
    });