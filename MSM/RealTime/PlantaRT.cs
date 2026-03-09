using Microsoft.AspNet.SignalR;
using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Models.Envasado;
using MSM.Models.Planta;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.RealTime
{
    public static class PlantaRT
    {
        private static bool _datosOK = false; // Indica si los datos cargados son correctos o ha habido algun problema.
        public static Planta planta; // Almacena la variable con todos los datos del estados real de la planta en ese momento
        public static Hashtable zonasOrden;
        public static ReasonTree reasonTree; // Almacena el arbol maestro de razones de los paros y perdidas
        public static Hashtable usuarios; // Lista de usuarios conectados
        private static readonly object lockerDatosPlanta = new object();
        public static Programador programadorPlantaRT;
        public static ProgramadorMSM programadorPlantaRT_MSM;
        //public static bool logsProgramador = false;

        public static bool activarLogCambioEstadoOrdenes = false;
        public static bool activarLogCambioEstadoMaquinas = false;
        public static bool activarLogOrdenesPausadasFinalizadas = false;
        public static bool activarLogDatosProduccionCambiosTurno = false;
        public static bool activarLogVideowall = false;
        public static bool activarLogCambioALT = false;
        public static bool activarLogTiemposParosMaquina = false;
        public static bool activarLogEnvasesLlenadora = false;

        public static Dictionary<string, string> fechasFinEstimadasLinea = new Dictionary<string, string>();

        // Propiedad para obtener y cambiar la variable _datosOK (ejecutando el evento cambioEstadoDatos que avisa a los clientes)
        public static bool datosOk
        {
            get { return _datosOK; }
            set
            {
                _datosOK = value;
                cambioEstadoDatos(_datosOK);
            }
        }

        // Función que avisa a los clientes del cambio de estado de los datos
        private static void cambioEstadoDatos(bool estado)
        {
            var context = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();
            context.Clients.All.estadoDatos(estado);
        }

        // Función que avisa a los clientes del cambio de estado de los datos
        private static void cargandoDatos(string txt)
        {
            var context = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();
            context.Clients.All.cargandoDatos(txt);
        }

        public static bool ObtenerDatosPlanta(bool fuerza)
        {
            try
            {
                lock (lockerDatosPlanta)
                {
                    if (!datosOk)
                    {
                        //LEA
                        //Obtenemos sesiones activas si las hubiera
                        if (PlantaRT.usuarios == null) PlantaRT.usuarios = new Hashtable();

                        if (fuerza) throw new Exception("");
                        cargandoDatos("Cargando");
                        DAO_Planta bdPlanta = new DAO_Planta();
                        string plantaID = ConfigurationManager.AppSettings["PlantaID"].ToString();
                        string plantaName = ConfigurationManager.AppSettings["PlantaNombre"].ToString();
                        bool test = (ConfigurationManager.AppSettings["Test"]?.ToString() ?? "false") == "true";

                        planta = new Planta(plantaID, plantaName, test);

                        //Obtenemos la relacion de zonas y ordenes
                        zonasOrden = bdPlanta.ObtenerOrdenesZonas();

                        //Obtenemos los productos que tiene la planta
                        planta.productos = bdPlanta.obtenerProductosPlanta();

                        DAO_ReasonTree daoReasonTree = new DAO_ReasonTree();
                        //Obtenemos el arbol de razones para paros y perdidas
                        reasonTree = daoReasonTree.LoadReasonTree();

                        if (ConfigurationManager.AppSettings["ACT_DATOS_PRODUCCION"] == "true")
                        {
                            //Actualiza los datos de producción del turno actual
                            //ActDatosProduccion actProduccion = new ActDatosProduccion();
                            //actProduccion.UpdateModel(DateTime.Now.ToUniversalTime());
                            //ActDatosProduccionOrden actProduccionOrden = new ActDatosProduccionOrden();
                            //actProduccionOrden.ActualizarDatosProduccionOrdenesPendientes();
                            
                            ActDatosProduccionMaquina actProduccionMaquina = new ActDatosProduccionMaquina();
                            actProduccionMaquina.FillDatosProduccionHoras();
                        }

                        datosOk = true;
                    }

                    return datosOk;
                }
            }
            catch(Exception ex)
            {
                cargandoDatos("Error" + ex.Message);
                return false;
            }
        }

        public static List<Orden> obtenerOrdenesActivasPendientes()
        {
            List<Orden> lstOrden = new List<Orden>();

            if (planta != null)
            {
                foreach (Linea linea in planta.lineas)
                {
                    lstOrden.AddRange(linea.ordenesActivas);
                    lstOrden.AddRange(linea.ordenesPendientes);
                }
            }
            return lstOrden;
        }

        internal static async void ObtenerDatosPlantaCiclico()
        {
            programadorPlantaRT = new Programador();
            bool plantaCargada = ObtenerDatosPlanta(false);
            bool programadorIniciado = false;
            int reintentos = 10;
            int r = 0;

            if (plantaCargada)
            {
                programadorIniciado = programadorPlantaRT.iniciar();
            }

            // Si ha fallado la carga de datos de la planta o el programador, lo reintentamos cada 30 segundos, 10 reintentos
            while ((!plantaCargada || !programadorIniciado) && r < reintentos)
            {
                await Task.Delay(30000);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, "Reintento "+ (r+1) +" cargar datos de la planta (" + plantaCargada + ") o iniciando el programador (" + programadorIniciado + ")", "PlantaRT.ObtenerDatosPlantaCiclico", "WEB-REALTIME", "Sistema");

                if (!plantaCargada)
                {
                    plantaCargada = ObtenerDatosPlanta(false);
                }

                if (plantaCargada && !programadorIniciado)
                {
                    programadorIniciado = programadorPlantaRT.iniciar();
                }
                r++;
            }

            if (!plantaCargada || !programadorIniciado)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, "Error cargando los datos de la planta (" + plantaCargada + ") o iniciando el programador (" + programadorIniciado + ")", "PlantaRT.ObtenerDatosPlantaCiclico", "WEB-REALTIME", "Sistema");
            }

            if (plantaCargada)
            {
                IniciarProgramadorMSM();
            }
        }

        internal static void IniciarProgramadorMSM()
        {
            programadorPlantaRT_MSM = new ProgramadorMSM();            
            programadorPlantaRT_MSM.IniciarProgramadorMSM();
        }
    }
}