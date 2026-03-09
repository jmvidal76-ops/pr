using Common.Models.Planta;
using Microsoft.AspNet.SignalR;
using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Models.Envasado;
using MSM.RealTime;
using Quartz;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace MSM
{
    [DisallowConcurrentExecution]
    public class ActDatosProduccionMaquina : IJob
    {
        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public void FillDatosProduccionHoras()
        {
            try
            {
                //Actualizamos los datos de producción
                //Para las llenadoras
                foreach (Linea lin in PlantaRT.planta.lineas)
                {
                    Turno turno = PlantaRT.planta.turnoActual.Find(x => x.linea.id == lin.id);

                    if (turno != null && turno.turnoProductivo // Nos aseguramos que la información del turno actual esta cargada
                        && turno.inicio < DateTime.Now.ToUniversalTime() //Nos aseguramos que el objeto con el supuesto turno actual está iniciado
                        && turno.inicio.AddHours(1) < DateTime.Now.ToUniversalTime()) //A demas si no estamos en la segunda hora no necesitamos rellenar previamente la coleccion de datos de horas del turno
                    {
                        foreach (Maquina maq in lin.obtenerMaquinas)// lin.obtenerMaquinasPorTipo("LLENADORA"))
                        {
                            setDatosProduccionMaquinaTurno(turno, maq);
                        }
                    }
                    else 
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 8, 2, "Turno: " + (turno == null ? "Nulo" : turno.idTurno.ToString()) + ". EsTurnoProductivo: " + 
                            (turno == null ? "Nulo" : turno.turnoProductivo.ToString()) + ". InicioTurno: " + (turno == null ? "Nulo" : turno.inicio.ToString("dd/MM/yyyy HH:mm:ss")) + 
                            ". Hora actual UTC: " + DateTime.Now.ToUniversalTime().ToString("dd/MM/yyyy HH:mm:ss"),
                            "ActDatosProduccionMaquina.FillDatosProduccionHoras", "I-MES-REALTIME", "Sistema");
                    }
                }

                hub.Clients.All.notProd();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ActDatosProduccionMaquina.FillDatosProduccionHoras", "I-MES-REALTIME", "Sistema");
                throw ex;
            }
        }

        public async void Execute(IJobExecutionContext context)
        {
            try
            {
                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                {
                    DAO_Log.EscribeLog("ACTUALIZAR PRODUCCIÓN Y CAMBIOS DE TURNO", "INICIO", "Info");
                }
                Stopwatch tim = Stopwatch.StartNew();
                tim.Start();

                await DAO_Planta.ActualizarFechaUltimaEjecucionPerroGuardian((int)TipoEnumProcesoPerroGuardian.ActualizarProduccionYCambioTurno);

                DateTime dtNow = context.FireTimeUtc.Value.UtcDateTime;
                DateTime dtHoraActualUtc = new DateTime(dtNow.Year, dtNow.Month, dtNow.Day).AddHours(dtNow.Hour);

                string logSubProcesos = "";
                string idJob = DateTime.Now.Hour.ToString() + ":" + DateTime.Now.Minute.ToString();

                CambiosTurnoActual ct = new CambiosTurnoActual();
                if (!ct.ComprobarCambioTurno(context, ref logSubProcesos))
                {
                    if (context.FireTimeUtc.Value.Minute == 0)
                    {
                        dtHoraActualUtc = dtHoraActualUtc.AddHours(-1);
                    }

                    ActualizarDatosProduccionPlanta(context, dtHoraActualUtc, ref logSubProcesos);
                }
                else
                {
                    hub.Clients.All.notProd();
                    //hub.Clients.All.cerrarSesionUsuarios();
                }

                //logSubProcesos += " Tiempo total del proceso " + tim.Elapsed + ";" + Environment.NewLine;

                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-DURACIÓN", tim.Elapsed.ToString(), "Info");
                    DAO_Log.EscribeLog("ACTUALIZAR PRODUCCIÓN Y CAMBIOS DE TURNO", "FIN", "Info");
                }

                tim.Stop();

                //if (PlantaRT.logsProgramador)
                //{
                //    DAO_Log.RegistrarLogBook("WEB-BACKEND", 8, 3, logSubProcesos, "ActDatosProduccionMaquina.Execute", "I-MES-REALTIME", "Sistema");
                //}
            }
            catch (Exception ex)
            {
                if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                {
                    DAO_Log.EscribeLog("PROD_CAMB_TUR-Actualizar producción y cambios de turno", "Error: " + ex.Message, "Error");
                }

                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ActDatosProduccionMaquina.Execute", "I-MES-REALTIME", "Sistema");
                //throw ex;
            }
        }

        private void ActualizarDatosProduccionPlanta(IJobExecutionContext context, DateTime dtHoraActualUtc, ref string logStr)
        {
            Stopwatch tim = Stopwatch.StartNew();
            tim.Start();

            ActualizarDatosProduccion(context, dtHoraActualUtc, ref logStr);

            if (PlantaRT.activarLogDatosProduccionCambiosTurno)
            {
                DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración método ActualizarDatosProduccion", tim.Elapsed.ToString(), "Info");
            }
            tim.Restart();

            ActDatosProduccionOrden dpo = new ActDatosProduccionOrden();
            dpo.ActualizarDatosProduccion(context.FireTimeUtc.Value.UtcDateTime, dtHoraActualUtc);

            if (PlantaRT.activarLogDatosProduccionCambiosTurno)
            {
                DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración método ActualizarDatosProduccion para órdenes", tim.Elapsed.ToString(), "Info");
            }

            hub.Clients.All.notProd();
            //hub.Clients.All.notProdOrden();
            tim.Stop();
        }

        public void ActualizarDatosProduccion(IJobExecutionContext context, DateTime dtHoraActualUtc, ref string logStr)
        {
            Stopwatch tim = Stopwatch.StartNew();
            tim.Start();

            foreach (Linea lin in PlantaRT.planta.lineas)
            {
                Turno turno = PlantaRT.planta.turnoActual.Find(x => x.linea.id == lin.id);

                if (turno != null && turno.turnoProductivo && turno.inicio < context.FireTimeUtc.Value.UtcDateTime)
                {
                    foreach (Maquina maq in lin.obtenerMaquinas)
                    {
                        setDatosProduccionMaquinaHora(context, dtHoraActualUtc, turno, maq, ref logStr);
                    }
                    //logStr += " SP11 - Se han actualizado los datos de producción de las máquinas de la línea " + lin.numLineaDescripcion + " - " + tim.Elapsed + ";" + Environment.NewLine;
                    if (PlantaRT.activarLogDatosProduccionCambiosTurno)
                    {
                        DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración datos de producción de las máquinas de la línea " + lin.numLineaDescripcion, tim.Elapsed.ToString(), "Info");
                    }
                    tim.Restart();
                }
            }
            
            tim.Stop();
        }

        private static void setDatosProduccionMaquinaHora(IJobExecutionContext context, DateTime dtHoraActualUtc, Turno turno, Maquina maq, ref string logStr)
        {
            List<DatosProduccion> datosPorduccionHoras = new List<DatosProduccion>();
            switch (maq.tipo.nombre)
            {
                case "PALETIZADORA":
                case "ENCAJONADORA":
                case "EMPAQUETADORA":
                case "CLASIFICADOR":
                case "INSPECTOR_BOTELLAS_VACIAS":
                case "INSPECTOR_SALIDA_LLENADORA":
                case "INSPECTOR_BOTELLAS_LLENAS"://id 87
                case "BASCULA": //id 78
                    datosPorduccionHoras = maq.datosSeguimiento.datosProduccionHoras;
                    setDatosProdMaquinaHora(context, dtHoraActualUtc, turno, maq, datosPorduccionHoras, ref logStr);
                    break;
                case "LLENADORA":
                    datosPorduccionHoras = maq.datosSeguimiento.datosProduccionHoras;
                    setDatosProdMaquinaHora(context, dtHoraActualUtc, turno, maq, datosPorduccionHoras, ref logStr);
                    setDatosProdParosPerdidasTurnoMaquina(context, turno, maq, maq.datosSeguimiento);
                    //logStr += " SP09 - Se actualizan datos de producción de paros y pérdidas;" + Environment.NewLine;
                    break;
                case "ETIQUETADORA_PALETS":
                    break;
                default:
                    DatosProduccion datosProduccionTurno = new DatosProduccion();
                    datosProduccionTurno.maquina = maq;
                    setDatosProdMaquinaTurno(context, dtHoraActualUtc, datosProduccionTurno, turno);
                    //logStr += " SP10 - Se actualizan datos de producción de la máquina " + maq.descripcion + ";" + Environment.NewLine;
                    maq.datosSeguimiento.datosProduccionTurno = datosProduccionTurno;
                    break;
            }
        }

        private static void setDatosProdMaquinaTurno(IJobExecutionContext context, DateTime dtHoraActualUtc, DatosProduccion datosProduccionTurno, Turno turno)
        {
            DAO_Produccion daoProduccion = new DAO_Produccion();
            datosProduccionTurno.fecInicio = turno.inicio;
            datosProduccionTurno.fecFin = turno.fin;
            datosProduccionTurno.fecActual = context.FireTimeUtc.Value.DateTime;
            daoProduccion.SetDatosProduccionMaquina(datosProduccionTurno, dtHoraActualUtc);
        }

        private static void setDatosProdParosPerdidasTurnoMaquina(IJobExecutionContext context, Turno turno, Maquina m, DatosSeguimiento datosSeguimiento)
        {
            DatosSeguimiento datosProdParosPerdidas = DAO_Produccion.ObtenerResumenParosPerdidas(m.nombre, turno.inicio, context.FireTimeUtc.Value.DateTime);

            datosSeguimiento.NumParosMayoresTurno = datosProdParosPerdidas.NumParosMayoresTurno;
            datosSeguimiento.TiempoParosMayoresTurno = datosProdParosPerdidas.TiempoParosMayoresTurno;
            datosSeguimiento.NumParosMenoresTurno = datosProdParosPerdidas.NumParosMenoresTurno;
            datosSeguimiento.TiempoParosMenoresTurno = datosProdParosPerdidas.TiempoParosMenoresTurno;
            datosSeguimiento.TiempoBajaVelocidadTurno = datosProdParosPerdidas.TiempoBajaVelocidadTurno;

            datosSeguimiento.NumParosMayoresJTurno = datosProdParosPerdidas.NumParosMayoresJTurno;
            datosSeguimiento.TiempoParosMayoresJTurno = datosProdParosPerdidas.TiempoParosMayoresJTurno;
            datosSeguimiento.NumParosMenoresJTurno = datosProdParosPerdidas.NumParosMenoresJTurno;
            datosSeguimiento.TiempoParosMenoresJTurno = datosProdParosPerdidas.TiempoParosMenoresJTurno;
            datosSeguimiento.TiempoBajaVelocidadJTurno = datosProdParosPerdidas.TiempoBajaVelocidadJTurno;
        }

        private static void setDatosProdMaquinaHora(IJobExecutionContext context, DateTime dtHoraActualUtc, Turno turno, Maquina maq, List<DatosProduccion> datosPorduccionHoras, ref string logStr)
        {
            if (PlantaRT.activarLogDatosProduccionCambiosTurno)
            {
                DAO_Log.EscribeLog("PROD_CAMB_TUR-Método setDatosProdMaquinaHora", "Inicio", "Info");
            }
            Stopwatch tim = Stopwatch.StartNew();
            tim.Start();

            //logStr += " SP05 - Procesando máquina " + maq.descripcion + ";" + Environment.NewLine;
            DAO_Produccion daoProduccion = new DAO_Produccion();
            DatosProduccion horaActual = null;
            DateTime fireTimeUtc = Utilidades.Utils.TrimDateToMilliseconds(context.FireTimeUtc.Value.UtcDateTime);
            
            if (datosPorduccionHoras.Count() != 0)
            {
                horaActual = datosPorduccionHoras.Last<DatosProduccion>();
            }
            //context.FireTimeUtc.Value.UtcDateTime <= horaActual.fecFin => no funciona cuando son iguales por los miliseconds            
            if (horaActual != null && fireTimeUtc >= Utilidades.Utils.TrimDateToMilliseconds(horaActual.fecInicio) && fireTimeUtc <= Utilidades.Utils.TrimDateToMilliseconds(horaActual.fecFin))
            { // Es la hora en curso                            
                horaActual.fecActual = context.FireTimeUtc.Value.DateTime; //Hora actual en UTC
                daoProduccion.SetDatosProduccionMaquina(horaActual, dtHoraActualUtc);
                //logStr += " SP06 - Se actualizan datos de producción de la hora en curso;" + Environment.NewLine;

                //Comprobamos si la hora anterior ha obtenido sus datos de los consolidados en caso contrario los obtenemos
                int index = datosPorduccionHoras.Count - 2; //Penultima posición
                if (index >= 0)
                {
                    DatosProduccion horaAnterior = datosPorduccionHoras[index];
                    if (!horaAnterior.Consolidado)
                    {
                        horaAnterior.fecActual = horaAnterior.fecFin;
                        daoProduccion.SetDatosProduccionMaquina(horaAnterior, dtHoraActualUtc);
                        //logStr += " SP07 - Se actualizan datos de producción de la hora anterior a la hora en curso;" + Environment.NewLine;
                    }
                }
            }
            else
            { // Nueva hora
                if (horaActual == null) //No hay ninguna hora registrada en el turno (Metemos la primera hora del turno)          
                {
                    horaActual = new DatosProduccion();
                    horaActual.maquina = maq;
                    horaActual.fecInicio = turno.inicio;
                    horaActual.fecFin = turno.inicio.AddHours(1);
                    //horaActual.fecActual = context.FireTimeUtc.Value.UtcDateTime;
                    horaActual.fecActual = context.FireTimeUtc.Value.DateTime; //Hora actual en UTC
                    //DAO_Log.registrarLogTraza("ActDatosProduccionMaquina.cs", "ActualizarDatosProduccion", string.Format("No hay ninguna hora registrada en el turno (Metemos la primera hora del turno), fechaActualUTC:{0}, fechaFinUTC:{1}, Linea: {2}, Maquina: {3}", horaActual.fecFin.ToString(), horaActual.fecActual.ToString(), lin.numLinea, maq.id));
                }
                else //Ya hay horas registradas en el turno, metemos la siguiente
                {
                    DateTime finAnterior = horaActual.fecFin;
                    horaActual = new DatosProduccion();
                    horaActual.maquina = maq;
                    horaActual.fecInicio = finAnterior;
                    horaActual.fecFin = finAnterior.AddHours(1);
                    //horaActual.fecActual = context.FireTimeUtc.Value.ToLocalTime().DateTime;
                    horaActual.fecActual = context.FireTimeUtc.Value.DateTime; //Hora actual en UTC
                    //DAO_Log.registrarLogTraza("ActDatosProduccionMaquina.cs", "ActualizarDatosProduccion", string.Format("Ya hay horas registradas en el turno, metemos la siguiente, fechaActualUTC:{0}, fechaFinUTC:{1}, Linea: {2}, Maquina: {3}", horaActual.fecFin.ToString(), horaActual.fecActual.ToString(), lin.numLinea, maq.id));
                }

                daoProduccion.SetDatosProduccionMaquina(horaActual, dtHoraActualUtc);
                //logStr += " SP08 - Se actualizan datos de producción de la primera hora del turno o si ya existe de la siguiente de la máquina;" + Environment.NewLine;
                datosPorduccionHoras.Add(horaActual);
            }

            if (PlantaRT.activarLogDatosProduccionCambiosTurno)
            {
                DAO_Log.EscribeLog("PROD_CAMB_TUR-Duración", tim.Elapsed.ToString(), "Info");
                DAO_Log.EscribeLog("PROD_CAMB_TUR-Método setDatosProdMaquinaHora", "Fin", "Info");
            }

            tim.Stop();
        }

        private static void setDatosProduccionMaquinaTurno(Turno turno, Maquina maq)
        {
            List<DatosProduccion> datosProduccionHoras = new List<DatosProduccion>();
            switch (maq.tipo.nombre)
            {
                case "PALETIZADORA":
                case "LLENADORA":
                case "ENCAJONADORA":
                case "EMPAQUETADORA":
                case "CLASIFICADOR": //id 49
                case "INSPECTOR_BOTELLAS_VACIAS": //id 88
                case "INSPECTOR_SALIDA_LLENADORA": //ID 21
                case "INSPECTOR_BOTELLAS_LLENAS"://id 87
                case "BASCULA": //id 78
                    datosProduccionHoras = maq.datosSeguimiento.datosProduccionHoras;
                    setDatosProdMaquinaTurno(turno, maq, datosProduccionHoras);
                    break;
            }
        }

        private static void setDatosProdMaquinaTurno(Turno turno, Maquina maq, List<DatosProduccion> datosProduccionHoras)
        {
            if (datosProduccionHoras.Count > 8)
            {
                datosProduccionHoras.Clear();
            }

            DAO_Produccion daoProduccion = new DAO_Produccion();

            DatosProduccion datosProduccion = new DatosProduccion();
            datosProduccion.maquina = maq;

            datosProduccion.fecInicio = turno.inicio; //Desde el inicio del turno
            datosProduccion.fecFin = datosProduccion.fecInicio.AddHours(1); // una hora mas tarde
            datosProduccion.fecActual = datosProduccion.fecFin;

            while (datosProduccion.fecFin < DateTime.Now.ToUniversalTime())
            {   
                //Hasta que lleguemos a la penultima hora
                daoProduccion.SetDatosProduccionMaquina(datosProduccion, new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, DateTime.Now.Hour, 0, 0).ToUniversalTime());//Cargamos datos

                datosProduccionHoras.Add(datosProduccion);//Agregamos a la colección de datos de horas del turno de la maquina

                DateTime fecInicio = datosProduccion.fecFin; //Pasamos a la siguiente hora
                DateTime fecFin = fecInicio.AddHours(1);

                datosProduccion = new DatosProduccion();
                datosProduccion.maquina = maq;
                datosProduccion.fecInicio = fecInicio; //Pasamos a la siguiente hora
                datosProduccion.fecFin = fecFin;
                datosProduccion.fecActual = fecFin;
            }
        }
    }
}