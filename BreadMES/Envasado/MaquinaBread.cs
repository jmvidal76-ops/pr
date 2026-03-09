using System;
using System.Collections.Generic;

namespace BreadMES.Envasado
{
    public class MaquinaBread
    {
        private static bool trazasActivas = Convert.ToBoolean(System.Configuration.ConfigurationManager.AppSettings["Trazas"]);
        private static readonly object lockerFile = new object();
        private static readonly object lockerMaquinaBread = new object();
        /// <summary>
        /// Método que obtiene los datos de producción de una maquina en un rango de fechas determinado del OOE Client.
        /// </summary>
        /// <param name="fechaFin">Fecha Fin</param>
        /// <param name="fechaInicio">Fecha Inicio</param>
        /// <param name="maquina">Nombre de la máquina</param>
        /// <returns>Diccionario con la clave/valor de los datos de producción solicitados.</returns>
        public static Dictionary<string, object> obtenerDatosProduccionMaquina(DateTime fechaFin, DateTime fechaInicio, string maquina)
        {
            lock (lockerMaquinaBread)
            {
                //registrarLogTraza("MaquinasBread", "obtenerDatosProduccionMaquina", string.Format("Entra máquina: {0}", maquina));
                Dictionary<string, object> dictionaryResults = null;
                try
                {
                    OEECli.IOEERuntime oeeclient = new OEECli.OEERuntime();

                    object instanceId = null;
                    int instance_timeout_ms = 120;
                    OEECli.OEE_RETURN_VALUE returnValueOeeClient = OEECli.OEE_RETURN_VALUE.OEE_SUCCESS;

                    //Comprobamos que tenemos N instancias disponibles
                    returnValueOeeClient = oeeclient.ResizeFreeSet(1);
                    if (returnValueOeeClient == OEECli.OEE_RETURN_VALUE.OEE_SUCCESS)
                    {
                        //Obtenemos el identificador de la instancia disponible.
                        returnValueOeeClient = oeeclient.GetInstance(out instanceId, instance_timeout_ms);
                        if (returnValueOeeClient == OEECli.OEE_RETURN_VALUE.OEE_SUCCESS)
                        {
                            object equipmentID = null;
                            //Obtenemos el EquipmentID de la máquina solicitada
                            returnValueOeeClient = oeeclient.GetEquipmentId(instanceId, out equipmentID, maquina, ".", -1);

                            if (returnValueOeeClient == OEECli.OEE_RETURN_VALUE.OEE_SUCCESS)
                            {
                                //Añadimos el contexto con los datos con los que posteriormente se van a calcular los algoritmos 
                                oeeclient.AddContext(instanceId, 1, fechaInicio.ToOADate(), fechaFin.ToOADate(), (int)equipmentID, true);
                                oeeclient.ApplyContext(instanceId);

                                //Si la maquina es paletizadora
                                if (maquina.Contains("PAL") || maquina.Contains("EQP"))
                                {
                                    //Añadimos los Algoritmos que queremos ejecutar sobre el contexto aplicado anteriormente.
                                    oeeclient.AddAlgorithm(instanceId, -2, "TIEMPO_NETO", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 7, "TIEMPO_BRUTO", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 7, "TIEMPO_OPERATIVO", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 7, "TIEMPO_PLANIFICADO", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 28, "VELOCIDAD_NOMINAL_PALETIZADORA", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 31, "CONTADOR_PRODUCCION", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 31, "CONTADOR_RECHAZOS", null, OEECli.OEE_VERSION.OEE_V1);
                                }
                                else
                                {

                                    //Añadimos los Algoritmos que queremos ejecutar sobre el contexto aplicado anteriormente.
                                    oeeclient.AddAlgorithm(instanceId, -2, "TIEMPO_NETO", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 7, "TIEMPO_BRUTO", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 7, "TIEMPO_OPERATIVO", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 7, "TIEMPO_PLANIFICADO", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 28, "VELOCIDAD_NOMINAL_LLENADORA", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 31, "CONTADOR_PRODUCCION", null, OEECli.OEE_VERSION.OEE_V1);
                                    oeeclient.AddAlgorithm(instanceId, 31, "CONTADOR_RECHAZOS", null, OEECli.OEE_VERSION.OEE_V1);
                                }

                                // Initialize the request - Add <clusterType, clusterInterval>
                                //
                                oeeclient.AddCluster(instanceId, "ctByEquipmentIDs", -1);
                                oeeclient.ApplyCluster(instanceId);

                                //Ejecutamos los algoritmos añadidos
                                returnValueOeeClient = oeeclient.ExecuteAlgorithm(instanceId, OEECli.OEE_EXECUTION_MODE.OEE_SYNC);
                                if (returnValueOeeClient == OEECli.OEE_RETURN_VALUE.OEE_SUCCESS)
                                {
                                    object result_obj = null;
                                    //Obtenemos la lista de resultados obtenidos tras la ejecucion de los algoritmos
                                    returnValueOeeClient = oeeclient.GetResultList(instanceId, out result_obj, OEECli.OEE_VERSION.OEE_V1);
                                    if (returnValueOeeClient == OEECli.OEE_RETURN_VALUE.OEE_SUCCESS)
                                    {

                                        //Obtenemos los valores -> el objeto de resultados esta en la primera posision de la lista de resultados.
                                        object[] data_obj = (object[])((object[])result_obj)[0];

                                        if (data_obj.Length > 0)
                                        {
                                            dictionaryResults = new Dictionary<string, object>();
                                            //Obtenemos los nombres que cada algoritmo solicitado -> Las cabeceras de cada resultado estan en la segunta posicion de la lista de resultados
                                            object[] header_obj = (object[])((object[])result_obj)[1];

                                            //Recorremos todas las cabeceras para ir insertando en el diccionario
                                            foreach (object[] header in header_obj)
                                            {
                                                if (header.Length > 0)
                                                {
                                                    try
                                                    {
                                                        String fieldName = (string)header[0];
                                                        //El indice que ocupa la cabecera es el mismo que el del objeto de resultados.
                                                        int index = Array.IndexOf(header_obj, header);
                                                        object value = ((object[])(data_obj[0]))[index];
                                                        dictionaryResults.Add(fieldName, value);
                                                    }
                                                    catch (Exception)
                                                    {
                                                    }
                                                }
                                            }
                                            header_obj = null;
                                        }
                                        data_obj = null;
                                        result_obj = null;
                                    }

                                }
                                //Limpiamos el objeto cliente
                                oeeclient.EmptyContextList(instanceId);
                                oeeclient.EmptyAlgorithmList(instanceId);
                                oeeclient.EmptyClusterList(instanceId);
                                oeeclient = null;
                            }
                        }
                    }
                    //registrarLogTraza("MaquinasBread", "obtenerDatosProduccionMaquina", string.Format("Sale máquina: {0}", maquina));
                }
                catch (Exception ex)
                {
                    //registrarLogTraza("MaquinasBread", "obtenerDatosProduccionMaquina", ex.Message);
                    throw ex;
                }

                return dictionaryResults;
            }
        }
    }
}
