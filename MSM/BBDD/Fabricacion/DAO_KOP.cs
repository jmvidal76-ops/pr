using Clients.ApiClient.Contracts;
using Common.Models.Fabricacion.Coccion;
using Common.Models.Fabricacion.KOPs;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.DTO;
using MSM.DTO.Fabricacion;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using MSM.Utilidades;
using MSM_FabricacionAPI.Models.Mostos.KOPs;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Types;
using Siemens.SimaticIT.PDefM.Breads;
using Siemens.SimaticIT.PDefM.Breads.Types;
using Siemens.SimaticIT.POM.Breads;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Fabricacion
{
    public class DAO_KOP : IDAO_KOP
    {

        private string UriBase = ConfigurationManager.AppSettings["HostApiSiemensBrewingData"].ToString();
        private string UriBaseFabricacion = ConfigurationManager.AppSettings["HostApiFabricacion"].ToString();

        private string _urlKop;
        private string _urlProcessParameter;

        private IApiClient _api;
        public DAO_KOP()
        {
            _urlKop = UriBase + "kop/";
            _urlProcessParameter = UriBase + "processParameter/";
        }

        public DAO_KOP(IApiClient api)
        {
            _api = api;
        }

        public async Task<ReturnValue> UpdateWoTrafficLightKop(string orderId, String valor)
        {
            Order_BREAD orderBread = new Order_BREAD();
            String id = orderBread.Select("", 0, 0, "{PK}=" + orderId).FirstOrDefault().ID;
            KOP_GLOBAL _newKOP = new KOP_GLOBAL()
            {
                ID_ORDEN = id,
                NAME = "#ESTADO_KOPS",
                VALOR = valor.ToString(),
                FECHA = DateTime.UtcNow.Date.ToString(),
                VALOR_MAXIMO = string.Empty,
                VALOR_MINIMO = string.Empty,
                COD_KOP = "",
                FASE = "",
                DATATYPE = "",
                INDEX = "",
                KopsMultivalorFueraRango = false,
                KopsMultivalorSinRellenar = false,
                MEDIDA = "",
                PK = "",
                PROCCESS = "",
                SEMAFORO = "",
                TIPO = ""
            };

            return await InsertKopOrder(_newKOP);
        }

        public static int GetNextKopID()
        {
            try
            {
                CURVAS_KOP_DEF_BREAD defBread = new CURVAS_KOP_DEF_BREAD();
                List<CURVAS_KOP_DEF> listDef = new List<CURVAS_KOP_DEF>();

                listDef = defBread.Select("", 0, 0, "").ToList();

                if (listDef.Count != 0)
                    return listDef.Select(item => item.KopID).Distinct().Max() + 1;
                else
                    return 1;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.GetKOPCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetKOPCurvas", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS"));
            }
        }
        /// <summary>
        /// Método para obtener todos los KOPS
        /// </summary>
        /// <returns>Lista de KOPS</returns>
        /// 
        //public static List<KOPS_Maestro_FAB> GetKOPS()
        //{
        //    List<KOPS_Maestro_FAB> listaKOPS = new List<KOPS_Maestro_FAB>();

        //    using (MESEntities context = new MESEntities())
        //    {
        //        listaKOPS = context.KOPS_Maestro_FAB.ToList();GetColorKOPConstantes
        //    }

        //    return listaKOPS;
        //}

        public bool RecalcularKOPs(int idOrden, int idTipoWO)
        {
            try
            {
                using (MESFabEntities context = new MESFabEntities())
                {
                    context.API_ActualizarKOPSCalculados(idOrden);
                }

                using (MESFabEntities context = new MESFabEntities())
                {
                    var listadoMaestroKOPCalculado = (from maestroKOP in context.MaestroKOPs
                                            join kop in context.KOPs on maestroKOP.IdMaestroKOP equals kop.IdMaestroKOP
                                            where kop.IdWO == idOrden && maestroKOP.IdTipoKOP == (int)TipoKOP.Calculado 
                                            select new { maestroKOP, kop }).ToList();

                    foreach (var item in listadoMaestroKOPCalculado)
                    {
                        item.kop.IdEstadoKOP = DefinirEstado(item.kop, item.kop.Valor);
                    }

                    ActualizarPropiedadesWO(context, idOrden);

                    NumberStyles estilos = NumberStyles.AllowExponent | NumberStyles.AllowDecimalPoint | NumberStyles.AllowLeadingSign;

                    switch (idTipoWO)
                    {
                        case (int)TipoWO.Coccion:
                            ActualizarDatosWOCoccion(context, idOrden, estilos);
                            break;
                        case (int)TipoWO.Fermentacion:
                            ActualizarDatosWOFermentacion(context, idOrden, estilos);
                            break;
                        case (int)TipoWO.Trasiego:
                            ActualizarDatosWOTrasiego(context, idOrden, estilos);
                            break;
                        case (int)TipoWO.Guarda:
                            ActualizarDatosWOGuarda(context, idOrden, estilos);
                            break;
                        case (int)TipoWO.Filtracion:
                            ActualizarDatosWOFiltracion(context, idOrden, estilos);
                            break;
                        case (int)TipoWO.Prellenado:
                            ActualizarDatosWOPrellenado(context, idOrden, estilos);
                            break;
                    }

                    context.WOs.FirstOrDefault(x => x.IdWO == idOrden).Recalcular = false;

                    context.SaveChanges();

                    return true;
                }
            }
            catch (Exception ex)
            {
                string mensajeError = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "IdWO: " + idOrden + ". " + mensajeError + " -> " + ex.StackTrace, "DAO_KOP.RecalcularKOPs", 
                    "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        public static void UpdateRecalcular(int re, string idOrden)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand query = new SqlCommand("UPDATE dbo.Orden_Procesada_FAB set Recalcular = " + re.ToString() + " WHERE id = '" + idOrden + "'", connection))
                {
                    query.CommandType = CommandType.Text;
                    query.CommandTimeout = 20;

                    using (SqlDataAdapter adaptador = new SqlDataAdapter(query))
                    {
                        DataTable tabla = new DataTable();
                        adaptador.Fill(tabla);
                    }
                }
            }
        }
        /// <summary>
        /// Método que obtiene una lista de KOPS segun una orden
        /// </summary>
        /// <param name="idOrden">Id de la orden de la que se quieren obtener los KOPS
        /// <returns>Material</returns>
        public string GetKOPSCantidadNMaterial(string idOrden, string KOP)
        {
            string cantidadActual = "";

            using (MESEntities context = new MESEntities())
            {
                cantidadActual = context.KOPs_FAB.AsNoTracking().Where(m => m.ID_Orden.Equals(idOrden) && m.Des_KOP.Contains(KOP)).FirstOrDefault().Valor_Actual;
                cantidadActual = string.IsNullOrEmpty(cantidadActual) ? "0" : cantidadActual;
                cantidadActual.Replace(',', '.');
            }

            return cantidadActual;
        }

        /// <summary>
        /// Método que obtiene una lista de KOPS segun una orden
        /// </summary>
        /// <param name="idOrden">Id de la orden de la que se quieren obtener los KOPS
        /// <returns>Material</returns>
        public static List<KOPs_FAB_MultiValor> GetKOPSOrdenMaestro(int idOrden)
        {
            using (MESEntities context = new MESEntities())
            {
                return context.KOPs_FAB_MultiValor.AsNoTracking().Where(m => m.Cod_Orden.Equals(idOrden)).OrderBy(m => m.Sequence_Procedimiento).ThenBy(p => p.ID_Procedimiento).ThenBy(k => k.Sequence_KOP).ToList();
            }
        }

        internal async Task<ReturnValue> editarValoresKOP(dynamic kop)
        {
            using (MESFabEntities context = new MESFabEntities())
            {
                try
                {
                    string idOrden = kop.IDOrden.ToString();
                    string pk = kop.PkActVal.ToString();
                    var objKOP = context.KOPs.FirstOrDefault(x => x.IdKOP.ToString() == pk);

                    string valor = kop.ValorKOP.ToString().Replace(",", ".");
                    if (kop.Tipo_KOP.ToString().ToLower() == "datetime" && !string.IsNullOrEmpty(valor))
                    {
                        valor = Utils.ValidateFormatValue(valor);
                    }
                    objKOP.IdEstadoKOP = DefinirEstado(objKOP, valor);
                    objKOP.Valor = valor;

                    var objWO = context.WOs.FirstOrDefault(x => x.IdWO == objKOP.IdWO);

                    objWO.Recalcular = true;

                    await context.SaveChangesAsync();
                    return new ReturnValue(true);
                }
                catch (Exception ex)
                {
                    return new ReturnValue(false);
                }
            }
        }

        private static int DefinirEstado(KOPs objKOP, string valorparam)
        {
            int result = 1;
            try
            {
                using (MESFabEntities context = new MESFabEntities())
                {
                    var tipoValor = objKOP.MaestroKOPs.TipodatoMaestroKOP;

                    if (string.IsNullOrEmpty(valorparam))
                        return (int)TipoEstadosKOP.Inexistente;

                    if (string.IsNullOrEmpty(objKOP.ValorMax) || string.IsNullOrEmpty(objKOP.ValorMin))
                        return (int)TipoEstadosKOP.Bueno;

                    if (tipoValor == "datetime")
                    {
                        var valormin = DateTime.Parse(objKOP.ValorMin);
                        var valormax = DateTime.Parse(objKOP.ValorMax);
                        var valor = DateTime.Parse(valorparam);
                        if (valormin <= valor && valor <= valormax)
                            result = (int)TipoEstadosKOP.Bueno;
                        else
                            result = (int)TipoEstadosKOP.Malo;
                    }
                    else if (tipoValor == "float")
                    {
                        var valormin = float.Parse(objKOP.ValorMin.Replace('.', ','));
                        var valormax = float.Parse(objKOP.ValorMax.Replace('.', ','));
                        var valor = float.Parse(valorparam.Replace('.', ','));
                        if (valormin <= valor && valor <= valormax)
                            result = (int)TipoEstadosKOP.Bueno;
                        else
                            result = (int)TipoEstadosKOP.Malo;
                    }
                    else if (tipoValor == "int")
                    {
                        var valormin = int.Parse(objKOP.ValorMin);
                        var valormax = int.Parse(objKOP.ValorMax);
                        var valor = int.Parse(valorparam);
                        if (valormin <= valor && valor <= valormax)
                            result = (int)TipoEstadosKOP.Bueno;
                        else
                            result = (int)TipoEstadosKOP.Malo;
                    }
                    else if (tipoValor == "string")
                    {
                        result = (int)TipoEstadosKOP.Bueno;
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.DefinirEstado", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_REALIZANDO_LA") + ex.Message);
            }
        }

        private static void ActualizarPropiedadesWO(MESFabEntities context, int idOrden)
        {
            var listadoMaestroKOPPropiedades = (from maestroKOP in context.MaestroKOPs
                                                join kop in context.KOPs on maestroKOP.IdMaestroKOP equals kop.IdMaestroKOP
                                                where kop.IdWO == idOrden && (maestroKOP.CodKOP.Equals("COC046") || maestroKOP.CodKOP.Equals("COC006") ||
                                                maestroKOP.CodKOP.Equals("FER005") || maestroKOP.CodKOP.Equals("FER014") || maestroKOP.CodKOP.Equals("GUA028") ||
                                                maestroKOP.CodKOP.Equals("GUA027") || maestroKOP.CodKOP.Equals("FIL059") || maestroKOP.CodKOP.Equals("FIL005") ||
                                                maestroKOP.CodKOP.Equals("FIL026") || maestroKOP.CodKOP.Equals("FIL029") || maestroKOP.CodKOP.Equals("PRE014") ||
                                                maestroKOP.CodKOP.Equals("PRE015") || maestroKOP.CodKOP.Equals("PRE016"))
                                                select new { maestroKOP, kop }).ToList();

            var listadoPropiedadesWO = context.PropiedadesWO.Where(x => x.IdWO == idOrden).ToList();

            foreach (var item in listadoMaestroKOPPropiedades)
            {
                string descPropiedad = string.Empty;

                switch (item.maestroKOP.CodKOP)
                {
                    case "COC046":
                    case "FER005":
                    case "PRE014":
                        descPropiedad = "Extracto seco primitivo";
                        break;
                    case "COC006":
                        descPropiedad = "Eficiencia cocción";
                        break;
                    case "FER014":
                        descPropiedad = "Lote Levadura";
                        break;
                    case "GUA028":
                        descPropiedad = "Extracto original";
                        break;
                    case "GUA027":
                        descPropiedad = "GAF";
                        break;
                    case "FIL005":
                        descPropiedad = "Tiempo preparación filtro KG";
                        break;
                    case "FIL059":
                        descPropiedad = "Cantidad de KG + Clarificante";
                        break;
                    case "FIL026":
                        descPropiedad = "Porcentaje Presión Ciclo";
                        break;
                    case "FIL029":
                        descPropiedad = "Porcentaje Tierras Ciclo";
                        break;
                    case "PRE015":
                        descPropiedad = "Oxígeno";
                        break;
                    case "PRE016":
                        descPropiedad = "CO2";
                        break;
                }

                if (!string.IsNullOrEmpty(descPropiedad))
                {
                    listadoPropiedadesWO.FirstOrDefault(l => l.DescPropiedadWO == descPropiedad).ValorPropiedadWO = item.kop.Valor;
                }
            }
        }

        private static void ActualizarDatosWOCoccion(MESFabEntities context, int idOrden, NumberStyles estilos)
        {
            var listadoMaestroKOP = (from maestroKOP in context.MaestroKOPs
                                     join kop in context.KOPs on maestroKOP.IdMaestroKOP equals kop.IdMaestroKOP
                                     where kop.IdWO == idOrden
                                     select new { maestroKOP, kop }).ToList();

            // Cantidad producida
            string valorCantidadReal = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("COC045")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorCantidadReal))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).CantidadReal = decimal.Parse(valorCantidadReal.Replace('.', ','), estilos);
            }

            // Fecha inicio
            string valorFechaInicio = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("COC060")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaInicio))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaInicioReal = Convert.ToDateTime(valorFechaInicio);
            }

            // Fecha fin
            string valorFechaFin = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("COC106")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaFin))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaFinReal = Convert.ToDateTime(valorFechaFin);
            }
        }

        private static void ActualizarDatosWOFermentacion(MESFabEntities context, int idOrden, NumberStyles estilos)
        {
            var listadoMaestroKOP = (from maestroKOP in context.MaestroKOPs
                                     join kop in context.KOPs on maestroKOP.IdMaestroKOP equals kop.IdMaestroKOP
                                     where kop.IdWO == idOrden
                                     select new { maestroKOP, kop }).ToList();

            // Cantidad producida
            //string valorCantidadReal = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("FER025")).FirstOrDefault()?.kop.Valor;

            //if (string.IsNullOrEmpty(valorCantidadReal))
            //{
            string valorCantidadReal = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("FER039")).FirstOrDefault()?.kop.Valor;
            //}

            if (!string.IsNullOrEmpty(valorCantidadReal))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).CantidadReal = decimal.Parse(valorCantidadReal.Replace('.', ','), estilos);
            }

            // Fecha inicio
            string valorFechaInicio = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("FER042")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaInicio))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaInicioReal = Convert.ToDateTime(valorFechaInicio);
            }

            // Fecha fin
            string valorFechaFin = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("FER043")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaFin))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaFinReal = Convert.ToDateTime(valorFechaFin);
            }
        }

        private static void ActualizarDatosWOTrasiego(MESFabEntities context, int idOrden, NumberStyles estilos)
        {
            var listadoMaestroKOP = (from maestroKOP in context.MaestroKOPs
                                     join kop in context.KOPs on maestroKOP.IdMaestroKOP equals kop.IdMaestroKOP
                                     where kop.IdWO == idOrden
                                     select new { maestroKOP, kop }).ToList();

            // Cantidad producida
            string valorCantidadReal = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("TRA005")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorCantidadReal))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).CantidadReal = decimal.Parse(valorCantidadReal.Replace('.', ','), estilos);
            }

            // Fecha inicio
            string valorFechaInicio = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("TRA008")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaInicio))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaInicioReal = Convert.ToDateTime(valorFechaInicio);
            }

            // Fecha fin
            string valorFechaFin = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("TRA009")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaFin))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaFinReal = Convert.ToDateTime(valorFechaFin);
            }
        }

        private static void ActualizarDatosWOGuarda(MESFabEntities context, int idOrden, NumberStyles estilos)
        {
            var listadoMaestroKOP = (from maestroKOP in context.MaestroKOPs
                                     join kop in context.KOPs on maestroKOP.IdMaestroKOP equals kop.IdMaestroKOP
                                     where kop.IdWO == idOrden
                                     select new { maestroKOP, kop }).ToList();

            // Cantidad producida
            string valorCantidadReal = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("GUA002")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorCantidadReal))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).CantidadReal = decimal.Parse(valorCantidadReal.Replace('.', ','), estilos);
            }

            // Fecha inicio
            string valorFechaInicio = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("GUA029")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaInicio))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaInicioReal = Convert.ToDateTime(valorFechaInicio);
            }

            // Fecha fin
            string valorFechaFin = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("GUA030")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaFin))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaFinReal = Convert.ToDateTime(valorFechaFin);
            }
        }

        private static void ActualizarDatosWOFiltracion(MESFabEntities context, int idOrden, NumberStyles estilos)
        {
            var listadoMaestroKOP = (from maestroKOP in context.MaestroKOPs
                                     join kop in context.KOPs on maestroKOP.IdMaestroKOP equals kop.IdMaestroKOP
                                     where kop.IdWO == idOrden
                                     select new { maestroKOP, kop }).ToList();

            // Cantidad producida
            string valorCantidadReal = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("FIL016")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorCantidadReal))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).CantidadReal = decimal.Parse(valorCantidadReal.Replace('.', ','), estilos);
            }

            // Fecha inicio
            string valorFechaInicio = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("FIL001")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaInicio))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaInicioReal = Convert.ToDateTime(valorFechaInicio);
            }

            // Fecha fin
            string valorFechaFin = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("FIL004")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaFin))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaFinReal = Convert.ToDateTime(valorFechaFin);
            }
        }

        private static void ActualizarDatosWOPrellenado(MESFabEntities context, int idOrden, NumberStyles estilos)
        {
            var listadoMaestroKOP = (from maestroKOP in context.MaestroKOPs
                                     join kop in context.KOPs on maestroKOP.IdMaestroKOP equals kop.IdMaestroKOP
                                     where kop.IdWO == idOrden
                                     select new { maestroKOP, kop }).ToList();

            // Cantidad producida
            string valorCantidadReal = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("PRE027")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorCantidadReal))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).CantidadReal = decimal.Parse(valorCantidadReal.Replace('.', ','), estilos);
            }

            // Fecha inicio
            string valorFechaInicio = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("PRE023")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaInicio))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaInicioReal = Convert.ToDateTime(valorFechaInicio);
            }

            // Fecha fin
            string valorFechaFin = listadoMaestroKOP.Where(i => i.maestroKOP.CodKOP.Equals("PRE024")).FirstOrDefault()?.kop.Valor;

            if (!string.IsNullOrEmpty(valorFechaFin))
            {
                context.WOs.FirstOrDefault(x => x.IdWO == idOrden).FechaFinReal = Convert.ToDateTime(valorFechaFin);
            }
        }

        /// <summary>
        /// Actualiza los valores del kop en la base de datos SITMes
        /// </summary>
        /// <param name="ValuePK">PK del KOP</param>
        /// <param name="ValorActual">Valor del KOP</param>
        /// <param name="Ts">Fecha del KOP</param>
        private void ActualizarValorKOP_SITMes(string ValuePK, string ValorActual, DateTime Ts, string OrderId, string NameKOP)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("[Actualizar_Valores_KOP_SITMesDB]", connection))
                    {
                        comando.Parameters.Add(new SqlParameter("@ValuePk", ValuePK));
                        comando.Parameters.Add(new SqlParameter("@ACTL_VAL", ValorActual));
                        comando.Parameters.Add(new SqlParameter("@TS", Ts));
                        comando.Parameters.Add(new SqlParameter("@OrderId", OrderId));
                        comando.Parameters.Add(new SqlParameter("@NameKOP", NameKOP));
                        comando.CommandType = CommandType.StoredProcedure;
                        connection.Open();
                        comando.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ActualizarValorKOP_SITMes", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_REALIZANDO_LA") + ex.Message);
            }
        }

        /// <summary>
        /// Obtiene los KOPS manuales de una planta para mostrarlo en el grid
        /// </summary>
        /// <returns>Lista de KOPS manuales a nivel de fabrica</returns>
        //public static List<KOPS_Maestro_FAB> ObtenerKopsPlanta(string area)
        //{
        //    try
        //    {
        //        using (MESEntities context = new MESEntities())
        //        {
        //            //La vista MES_MSM_Fab.dbo.KOPs_Planta_FAB ha de ser añadida a EF
        //            List<KOPS_Maestro_FAB> listadoKopsPlanta = context.KOPS_Maestro_FAB.Where(m => m.KOP_Area.Equals(area)).ToList();
        //            return listadoKopsPlanta;
        //        }
        //    }
        //    catch (Exception exception)
        //    {
        //        DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.ObtenerKopsPlanta", exception, HttpContext.Current.User.Identity.Name);
        //        throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE"));
        //    }
        //}

        /// <summary>
        /// Metodo que obtiene los valores del KOP de planta a editar y lo manda al BREAD para que realice la operacion
        /// </summary>
        /// <param name="kop"></param>
        //internal static void editarValoresKOPPlanta(dynamic kop)
        //{

        //    try
        //    {
        //        if (!KOPBread.editarValoresKOPPlanta(kop))
        //            throw new Exception("Error modificando los valores de los KOPS de planta");
        //    }
        //    catch (Exception ex)
        //    {
        //        DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.editarValoresKOPPlanta", ex.Message, HttpContext.Current.User.Identity.Name);
        //        throw new Exception("Error modificando los valores de los KOPS de planta");
        //    }
        //}



        //internal static void AddValoresKOP(dynamic kop)
        //{
        //    try
        //    {
        //        if (!KOPBread.AddValoresKOP(kop))
        //            throw new Exception("Error añadiendo los valores de los KOPS de planta");
        //    }
        //    catch (Exception exception)
        //    {
        //        DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.AddValoresKOP", exception, HttpContext.Current.User.Identity.Name);
        //        throw new Exception("Error añadiendo KOPS de fabrica");
        //    }
        //}

        //internal static List<KOPs_Man_Planta_FAB> GetValoresKopsPlanta(int codKop, string salaCoccion)
        //{
        //    try
        //    {
        //        List<KOPs_Man_Planta_FAB> listaKOPS = new List<KOPs_Man_Planta_FAB>();

        //        using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
        //        {
        //            using (SqlCommand command = new SqlCommand("[MES_ObtenerKOPsSegunSC]", connection))
        //            {
        //                command.CommandType = CommandType.StoredProcedure;
        //                command.Parameters.AddWithValue("@salaCoccion", salaCoccion);
        //                command.Parameters.AddWithValue("@codKOP", codKop);

        //                using (SqlDataAdapter da = new SqlDataAdapter(command))
        //                {

        //                    connection.Open();
        //                    DataTable dt = new DataTable();
        //                    da.Fill(dt);
        //                    foreach (DataRow row in dt.Rows)
        //                    {
        //                        KOPs_Man_Planta_FAB kop = new KOPs_Man_Planta_FAB();
        //                        kop.Cod_KOP = int.Parse(row["Cod_KOP"].ToString());
        //                        kop.Cod_Material = int.Parse(row["Cod_Material"].ToString());
        //                        kop.Des_equipo = row["Des_equipo"].ToString();
        //                        kop.Des_KOP = row["Des_KOP"].ToString();
        //                        kop.Des_Material = row["Des_Material"].ToString();
        //                        kop.Fecha = row["Fecha"].ToString().Equals(String.Empty) ? (DateTime?)null : DateTime.Parse(row["Fecha"].ToString());
        //                        kop.IdMaterial = row["IdMaterial"].ToString();
        //                        kop.Semaforo = row["Semaforo"].ToString();
        //                        kop.Tipo_KOP = row["Tipo_KOP"].ToString();
        //                        kop.UOM_KOP = row["UOM_KOP"].ToString();
        //                        kop.Valor_Actual = row["Valor_Actual"].ToString();
        //                        kop.Valor_Maximo = row["Valor_Maximo"].ToString();
        //                        kop.Valor_Minimo = row["Valor_Minimo"].ToString();

        //                        listaKOPS.Add(kop);
        //                    }
        //                }
        //            }
        //        }

        //        return listaKOPS;
        //        //Antiguo metodo sin sala de coccion:
        //        //using (MESEntities context = new MESEntities())
        //        //{
        //        //    //La vista MES_MSM_Fab.dbo.KOPs_Planta_FAB ha de ser añadida a EF
        //        //    List<KOPs_Man_Planta_FAB> listadoKopsPlanta = context.KOPs_Man_Planta_FAB.Where(k => k.Cod_KOP == codKop).ToList();
        //        //    return listadoKopsPlanta;
        //        //}
        //    }
        //    catch (Exception exception)
        //    {
        //        DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.GetValoresKopsPlanta", exception, HttpContext.Current.User.Identity.Name);
        //        throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE"));
        //    }
        //}

        internal async Task<int> GetNumeroCoccionOrden(string numCoccion)
        {
            try
            {
                string url = string.Concat(_urlKop, "KOPValue?idOrden=", numCoccion, "&nombreKop=", "NUMERO_COCCION_DV");
                var _ret = await ApiClient.GetAsync(url);
                string numero = await _ret.Content.ReadAsAsync<string>();

                if (numero.Equals(String.Empty))
                    return 0;
                else
                    return int.Parse(numero);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetNumeroCoccionOrden", "WEB-FABRICACION", "Sistema");
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.GetNumeroCoccionOrden", "Error buscando el numero de coccion de una orden: " + e.Message, HttpContext.Current.User.Identity.Name);
                return 0;
            }
            //int numC = int.Parse(Siemens.Brewing.Data.KOP.KOPUtilities.valorKOP(numCoccion, "NUMERO_COCCION_DV"));
        }


        internal static List<DTO_KOP> GetKOPSPPR(string idMaterial, string salaCoccion, string area)
        {
            try
            {
                List<DTO_KOP> listaKOPS = new List<DTO_KOP>();
                string nombrePlanta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerKOPsSegunSCMaterial]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@salaCoccion", salaCoccion);
                        command.Parameters.AddWithValue("@idMaterial", idMaterial);
                        command.Parameters.AddWithValue("@area", area);
                        command.Parameters.AddWithValue("@planta", nombrePlanta.Split('.')[1]);

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {

                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);

                            foreach (DataRow row in dt.AsEnumerable().Where(item => !item.Field<String>("Formato").Equals("MULTIVALOR")))
                            {
                                DTO_KOP kop = new DTO_KOP();
                                kop.idValor = int.Parse(row["idVal"].ToString());
                                kop.descKOP = row["KOP"].ToString();
                                kop.fecha = DateTime.Parse(row["Fecha"].ToString());
                                kop.tipo = row["Tipo"].ToString().ToLower();
                                kop.uom = row["UOM"].ToString();
                                kop.valor = kop.tipo.Equals("float") && !String.IsNullOrEmpty(row["Valor"].ToString()) ? String.Format(CultureInfo.InvariantCulture, "{0:N2}", row["Valor"].ToString()) : row["Valor"].ToString();
                                kop.maximo = kop.tipo.Equals("float") && !String.IsNullOrEmpty(row["Maximo"].ToString()) ? String.Format(CultureInfo.InvariantCulture, "{0:N2}", row["Maximo"].ToString()) : row["Maximo"].ToString();
                                kop.minimo = kop.tipo.Equals("float") && !String.IsNullOrEmpty(row["Minimo"].ToString()) ? String.Format(CultureInfo.InvariantCulture, "{0:N2}", row["Minimo"].ToString()) : row["Minimo"].ToString();
                                kop.procedimiento = row["Procedimiento"].ToString();
                                kop.material = row["Material"].ToString();
                                kop.formato = row["Formato"].ToString();
                                kop.semaforo = "Verde";// row["Semaforo"].ToString();

                                if (string.IsNullOrEmpty(kop.valor))
                                    kop.semaforo = "Azul";
                                else
                                {
                                    if (!kop.tipo.Equals("string"))
                                        if (!string.IsNullOrEmpty(kop.maximo) || !string.IsNullOrEmpty(kop.minimo))
                                        {
                                            Object valor = null;
                                            switch (kop.tipo)
                                            {
                                                case "int":
                                                    valor = int.Parse(kop.valor);
                                                    break;
                                                case "float":
                                                    valor = float.Parse(kop.valor);
                                                    break;
                                                case "datetime":
                                                    valor = DateTime.Parse(kop.valor);
                                                    break;
                                            }

                                            if (!string.IsNullOrEmpty(kop.maximo))
                                            {
                                                Object maximo = null;
                                                switch (kop.tipo)
                                                {
                                                    case "int":
                                                        maximo = int.Parse(kop.maximo);
                                                        if ((int)maximo < (int)valor)
                                                            kop.semaforo = "Rojo";
                                                        break;
                                                    case "float":
                                                        maximo = float.Parse(kop.maximo);
                                                        if ((float)maximo < (float)valor)
                                                            kop.semaforo = "Rojo";
                                                        break;
                                                    case "datetime":
                                                        maximo = DateTime.Parse(kop.maximo);
                                                        if ((DateTime)maximo < (DateTime)valor)
                                                            kop.semaforo = "Rojo";
                                                        break;
                                                }
                                            }

                                            if (!string.IsNullOrEmpty(kop.minimo))
                                            {
                                                Object minimo = null;
                                                switch (kop.tipo)
                                                {
                                                    case "int":
                                                        minimo = int.Parse(kop.minimo);
                                                        if ((int)minimo > (int)valor)
                                                            kop.semaforo = "Rojo";
                                                        break;
                                                    case "float":
                                                        minimo = float.Parse(kop.minimo);
                                                        if ((float)minimo > (float)valor)
                                                            kop.semaforo = "Rojo";
                                                        break;
                                                    case "datetime":
                                                        minimo = DateTime.Parse(kop.minimo);
                                                        if ((DateTime)minimo > (DateTime)valor)
                                                            kop.semaforo = "Rojo";
                                                        break;
                                                }
                                            }
                                        }
                                }
                                kop.tipo = row["Tipo"].ToString();
                                listaKOPS.Add(kop);
                            }
                        }
                    }
                }

                return listaKOPS;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.GetKOPSPPR", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetKOPSPPR", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_UN"));
            }
        }

        internal static void editarValoresKOPProceso(dynamic kop)
        {
            try
            {

                string valor = kop.valor.ToString();
                string max = kop.maximo.ToString();
                string min = kop.minimo.ToString();
                string idValor = kop.idValor.ToString();
                string fecha = kop.Fecha.ToString();

                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ActualizaKOPProceso]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@valor", valor.Replace(',', '.'));
                        command.Parameters.AddWithValue("@min", min.Replace(',', '.'));
                        command.Parameters.AddWithValue("@max", max.Replace(',', '.'));
                        command.Parameters.AddWithValue("@idValor", idValor);
                        command.Parameters.AddWithValue("@fecha", fecha);

                        connection.Open();
                        command.ExecuteNonQuery();

                    }
                }

            }
            catch (Exception ex)
            {
                ///DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.editarValoresKOPProceso", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.EditarValoresKOPSProceso", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_MODIFICANDO_LOS"));
            }
        }


        internal static List<Object> GetKOPSCurvaByPhase(string condition)
        {
            try
            {
                CURVAS_KOP_DEF_BREAD defBread = new CURVAS_KOP_DEF_BREAD();
                List<Object> listaCurvas = new List<Object>();
                String kop = String.Empty;

                condition = System.Text.Encoding.UTF8.GetString(System.Text.Encoding.GetEncoding("ISO-8859-8").GetBytes(condition));
                defBread.Select("", 0, 0, condition).ToList().ForEach(item => { if (!item.Name.Equals(kop)) { kop = item.Name; listaCurvas.Add(new { Name = item.Name, KopID = item.KopID }); } });

                return listaCurvas.Distinct().ToList();
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetKOPCurvas", "WEB-FABRICACION", "Sistema");
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.GetKOPCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS"));
            }
        }

        internal static void ImportKopsMultivalorByDefault(dynamic datas)
        {
            try
            {
                String defaultMaterial = datas[0].material.ToString();
                String defaultPhase = System.Text.Encoding.UTF8.GetString(System.Text.Encoding.GetEncoding("ISO-8859-8").GetBytes(datas[0].phase.ToString()));
                String condition = String.Empty;
                List<CURVAS_KOP_DEF> defaultList = new List<CURVAS_KOP_DEF>();
                List<CURVAS_KOP_DEF> auxList = new List<CURVAS_KOP_DEF>();
                List<CURVAS_KOP_CFG> defaultCfg = new List<CURVAS_KOP_CFG>();
                CURVAS_KOP_CFG_BREAD cfgBread = new CURVAS_KOP_CFG_BREAD();
                string material, phase;
                CURVAS_KOP_DEF auxElement, auxElement2;
                CURVAS_KOP_CFG cfgElement, auxCfg;

                dynamic element;
                List<int> aux = new List<int>();

                condition = "{Material} = 'Default' AND {OrderID} = -1 AND {Phase} = '" + defaultPhase + "'";

                CURVAS_KOP_DEF_BREAD defBread = new CURVAS_KOP_DEF_BREAD();
                defaultList = defBread.Select("", 0, 0, condition).ToList();

                for (int i = 1; i <= datas.Count - 1; i++)
                {
                    element = datas[i];
                    for (int j = 0; j <= defaultList.Count - 1; j++)
                    {
                        material = element.Material.ToString();
                        phase = System.Text.Encoding.UTF8.GetString(System.Text.Encoding.GetEncoding("ISO-8859-8").GetBytes(element.Phase.ToString()));
                        //obtiene las definiciones de los multivalor por defecto
                        auxList = defBread.Select("", 0, 0, "{Material} = '" + material + "' AND {OrderID} = -1 AND {Phase} = '" + phase + "'").ToList();
                        aux = auxList.Select(item => item.KopID).ToList();
                        //obtiene las etiquetas de los multivalor por defecto
                        defaultCfg = cfgBread.Select("", 0, 0, "{KopID} = " + defaultList.ElementAt(j).KopID + " AND {OrderID} = -1 AND {Material} ='" + defaultList.ElementAt(j).Material + "'").ToList();
                        if (!aux.Contains(defaultList.ElementAt(j).KopID))
                        {
                            //Añadirá el kop multivalor si el artículo no lo tiene
                            auxElement = defaultList.ElementAt(j);
                            auxElement.Material = material;
                            defBread.Create(auxElement);
                            foreach (var cfg in defaultCfg)
                            {
                                //Se añaden las etiquetas por defecto
                                cfg.Material = auxElement.Material;
                                cfgBread.Create(cfg);
                            }
                        }
                        else
                        {
                            //si existe se renombrarán los seleccionados con los nombres por defecto
                            auxElement2 = auxList.Find(item => item.KopID == defaultList.ElementAt(j).KopID);
                            auxElement2.Name = defaultList.ElementAt(j).Name;
                            defBread.Edit(auxElement2);

                            foreach (var cfg in defaultCfg)
                            {
                                //se añadirán las etiquetas que no existan, si alguna existe no se reimportará
                                cfgElement = cfgBread.Select("", 0, 0, "{Label} = '" + cfg.Label + "' AND {OrderID} = -1 AND {Material} = '" + material + "' AND {KopID} =" + defaultList.ElementAt(j).KopID).ToList().FirstOrDefault();
                                if (cfgElement == null)
                                {
                                    //Se comprueba que el índice no esté ocupado, si lo está, prevalece el de defecto
                                    foreach (var auxCfg2 in cfgBread.Select("", 0, 0, "{OrderID} = -1 AND {Material} = '" + material + "' AND {KopID} =" + defaultList.ElementAt(j).KopID + " AND {Index} >=" + cfg.Index.ToString()).ToList())
                                    {
                                        auxCfg2.Index += 1;
                                        cfgBread.Edit(auxCfg2);
                                    }
                                    cfg.Material = material;
                                    cfgBread.Create(cfg);
                                }
                                else
                                {
                                    //Si la etiqueta existe se toman los datos de la de por defecto
                                    cfgElement.Label = cfg.Label;
                                    cfgElement.Min_Value = cfg.Min_Value;
                                    cfgElement.Max_Value = cfg.Max_Value;
                                    cfgElement.UOM = cfg.UOM;

                                    //Se comprueba que el índice no esté ocupado, si lo está, prevalece el de defecto
                                    foreach (var auxCfg2 in cfgBread.Select("", 0, 0, "{OrderID} = -1 AND {Material} = '" + material + "' AND {KopID} =" + defaultList.ElementAt(j).KopID + " AND {Index} >=" + cfg.Index.ToString()).ToList())
                                    {
                                        auxCfg2.Index += 1;
                                        cfgBread.Edit(auxCfg2);
                                    }

                                    cfgElement.Index = cfg.Index;
                                    cfgBread.Edit(cfgElement);
                                }
                            }
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.ImportKopsMultivalorByDefault", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ImportarKopsdMultivalorByDefault", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_IMPORTANDO_LOS"));
            }
        }

        internal static void DeleteCurva(dynamic datas)
        {
            try
            {
                String material = datas.Material.ToString();
                String orderID = datas.OrderID.ToString();
                String kopID = datas.KopID.ToString();
                String condition = String.Empty;

                if (material.Contains("Dummy"))
                    condition = "{KopID} =" + kopID + " AND {OrderID} = " + orderID;
                else
                    condition = "{KopID} =" + kopID + " AND {Material} = '" + material + "' AND {OrderID} = " + orderID;

                CURVAS_KOP_DEF_BREAD defBread = new CURVAS_KOP_DEF_BREAD();

                foreach (var item in defBread.Select("", 0, 0, condition).ToList())
                    defBread.Delete(item);

                CURVAS_KOP_CFG_BREAD cfgBread = new CURVAS_KOP_CFG_BREAD();

                foreach (var item in cfgBread.Select("", 0, 0, condition).ToList())
                    cfgBread.Delete(item);

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.DeleteCurva", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.DeleteCurva", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_LOS"));
            }
        }

        internal static List<CURVAS_KOP_DEF> GetKOPCurvas(string condition)
        {
            try
            {
                CURVAS_KOP_DEF_BREAD defBread = new CURVAS_KOP_DEF_BREAD();
                List<CURVAS_KOP_DEF> listaCurvas = new List<CURVAS_KOP_DEF>();

                listaCurvas = defBread.Select("KopID asc", 0, 0, System.Text.Encoding.UTF8.GetString(System.Text.Encoding.GetEncoding("ISO-8859-8").GetBytes(condition))).ToList();


                //listaCurvas.All(c => { c.PK = c.PK.Substring(c.PK.LastIndexOf('#') + 1, c.PK.Length - c.PK.LastIndexOf('#') - 1); return true; });

                return listaCurvas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.GetKOPCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetKOPCurvas", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS"));
            }
        }

        public List<CURVAS_KOP_DEF> GetKOPCurvasBBDD(dynamic datos)
        {
            List<CURVAS_KOP_DEF> curvas = new List<CURVAS_KOP_DEF>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_CURVAS_KOP_DEF]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@orderId", (String.IsNullOrEmpty(datos.orderId.ToString()) ? null : datos.orderId.ToString()));
                    command.Parameters.AddWithValue("@enable", (String.IsNullOrEmpty(datos.enable.ToString()) ? null : datos.enable.ToString()));
                    command.Parameters.AddWithValue("@phase", (String.IsNullOrEmpty(datos.phase.ToString()) ? null : datos.phase.ToString()));
                    command.Parameters.AddWithValue("@material", (String.IsNullOrEmpty(datos.material.ToString()) ? null : datos.material.ToString()));
                    command.Parameters.AddWithValue("@area", (String.IsNullOrEmpty(datos.area.ToString()) ? null : datos.area.ToString()));

                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        try
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                CURVAS_KOP_DEF curva = new CURVAS_KOP_DEF();

                                curva.Name = (string)row["Name"];
                                curva.Datatype = (string)row["Datatype"];
                                curva.Enabled = (int)row["Enabled"];
                                curva.Phase = (string)row["Phase"];
                                curva.KopType = (int)row["KopType"];
                                curva.OrderID = (int)row["OrderID"];
                                curva.Area = (string)row["Area"];
                                curva.Proccess = (string)row["Proccess"];
                                curva.Material = (string)row["Material"];
                                curva.KopID = (int)row["KopID"];
                                curvas.Add(curva);
                            }
                        }
                        catch (Exception ex)
                        {
                            //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.GetKOPCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetKOPCurvasBBDD", "WEB-FABRICACION", "Sistema");
                            throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS"));
                        }
                    }
                }
            }

            return curvas;
        }

        internal static ReturnValue crearCurva(dynamic datos)
        {
            try
            {
                //Cada Kop se tieneque añadir a cada área y a los artículos que se indique desde la web
                CURVAS_KOP_DEF_BREAD defBread = new CURVAS_KOP_DEF_BREAD();
                CURVAS_KOP_DEF curva = new CURVAS_KOP_DEF();
                ProductSegment_BREAD ps = new ProductSegment_BREAD();
                String auxMaterial, auxPhase;
                ReturnValue ret;
                bool withIndex = false;

                curva.Name = datos.Name.ToString();
                curva.Enabled = 1;
                curva.Phase = System.Text.Encoding.UTF8.GetString(System.Text.Encoding.GetEncoding("ISO-8859-8").GetBytes(datos.Phase.ToString()));
                curva.Datatype = datos.DataType.ToString();
                curva.KopType = int.Parse(datos.kopType.ToString());
                curva.OrderID = -1;
                curva.Proccess = datos.Process.ToString();
                curva.Material = datos.Material.ToString();
                curva.KopID = Convert.ToInt32(datos.KopID.ToString());

                auxPhase = curva.Phase;
                switch (curva.Phase)
                {
                    case "BOILLING":
                        auxPhase = "COCCION";
                        break;

                    case "FERMENTATION":
                        auxPhase = "FERMENTACION";
                        break;

                    case "WARD":
                        auxPhase = "GUARDA";
                        break;

                    case "FILTRATION":
                        auxPhase = "FILTRACION";
                        break;

                    case "PREFILLED":
                        auxPhase = "PRELLENADO";
                        break;

                    case "DECANTING":
                        auxPhase = "TRASIEGO";
                        break;
                }

                //Se comprueba el número de áreas para la ppr principal
                List<String> areas = ps.Select("", 0, 0, "{PPRName} like '%" + System.Text.Encoding.UTF8.GetString(System.Text.Encoding.GetEncoding("ISO-8859-8").GetBytes(auxPhase)) + "%'").ToList().Select(item => item.PPRName).ToList<String>().Distinct().ToList();

                //Si el material seleccionado es el de defecto el kop se añadirá para todos los materiales,
                //sino, solo para el material seleccionado
                auxMaterial = curva.Material;
                foreach (String area in areas)
                {
                    curva.Area = area.Split('.')[area.Split('.').Length - 1];
                    if (auxMaterial.Contains("Dummy"))
                    {
                        //foreach (String item in ps.Select("", 0, 0, "{PPRName} like '%[_ .]" + curva.Area + "%'").ToList().Select(item => item.PPRName).ToList().Distinct())
                        //{
                        curva.Material = "Default";
                        ret = defBread.Create(curva);
                        if (!ret.succeeded)
                            return new ReturnValue(false, -1, ret.message);
                        //}
                    }
                    else
                    {
                        ret = defBread.Create(curva);
                        if (!ret.succeeded)
                            return new ReturnValue(false, -1, ret.message);
                    }
                }

                return new ReturnValue(true);

            }
            catch (Exception e)
            {
                return new ReturnValue(false, -1, e.Message);
            }

        }

        internal static ReturnValue ActualizarCFGCurva(dynamic datos)
        {
            try
            {
                ReturnValue ret;

                String KopID = datos.idkop.ToString();
                String material = datos.material.ToString();
                String oldLabel = datos.oldLabel.ToString();

                CURVAS_KOP_CFG_BREAD defBread = new CURVAS_KOP_CFG_BREAD();
                CURVAS_KOP_CFG curva = new CURVAS_KOP_CFG();

                curva = defBread.Select("", 0, 0, "{KopID} = " + KopID + " AND {Material} = '" + material + "' AND {OrderID} = -1 AND {Label} = '" + oldLabel + "'").FirstOrDefault();
                if (curva != null)
                {
                    curva.Label = datos.label.ToString();
                    curva.Max_Value = datos.max.ToString();
                    curva.Min_Value = datos.min.ToString();
                    curva.UOM = datos.uom.ToString();

                    ret = defBread.Edit(curva);
                }
                else
                    ret = new ReturnValue(false, -1, "ActualizarCFGCurva. No existe el valor de la curva");

                return ret;
            }
            catch (Exception e)
            {
                return new ReturnValue(false, -1, e.Message);
            }
        }

        internal static List<CURVAS_KOP_CFG> GetCFGCurva(int pkKop, String material, String area)
        {
            try
            {
                CURVAS_KOP_CFG_BREAD defBread = new CURVAS_KOP_CFG_BREAD();
                List<CURVAS_KOP_CFG> listaCurvas = new List<CURVAS_KOP_CFG>();

                listaCurvas = defBread.Select("", 0, 0, "{KopID}=" + pkKop.ToString() + " AND {Material} = '" + (material.Contains("defecto") ? "Default" : material) + "' AND {OrderID} = -1 AND {Area}='" + area + "'").OrderBy(item => item.Index).ToList();
                //  listaCurvas.All(c => { c.PK = c.PK.Substring(c.PK.LastIndexOf('#') + 1, c.PK.Length - c.PK.LastIndexOf('#') - 1); return true; });

                return listaCurvas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.GetKOPCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetCFGCurvas", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS"));
            }
        }

        public List<CURVAS_KOP_CFG> GetCFGCurvaBBDD(int pkKop, String material, String area)
        {
            List<CURVAS_KOP_CFG> curvas = new List<CURVAS_KOP_CFG>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_CURVAS_KOP_CFG]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@pkKop", pkKop);
                    command.Parameters.AddWithValue("@material", material);
                    command.Parameters.AddWithValue("@area", area);

                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {
                        try
                        {
                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                CURVAS_KOP_CFG curva = new CURVAS_KOP_CFG();

                                curva.Proccess = (string)row["Proccess"];
                                curva.Area = (string)row["Area"];
                                curva.Phase = (string)row["Phase"];
                                curva.Index = (int)row["Index"];
                                curva.OrderID = (int)row["OrderID"];
                                curva.KopID = (int)row["KopID"];
                                curva.UOM = (string)row["UOM"];
                                curva.Max_Value = (string)row["Max_Value"];
                                curva.Min_Value = (string)row["Min_Value"];
                                curva.Label = (string)row["Label"];
                                curva.Material = (string)row["Material"];
                                curvas.Add(curva);
                            }
                        }
                        catch (Exception ex)
                        {
                            //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.GetKOPCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetCFGCurvaBBDD", "WEB-FABRICACION", "Sistema");
                            throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS"));
                        }
                    }
                }
            }

            return curvas;
        }

        internal static ReturnValue crearCFGCurva(dynamic datos)
        {
            try
            {
                string label = datos.label.ToString();
                string min = datos.min.ToString();
                string max = datos.max.ToString();
                string idkop = datos.idkop.ToString();
                string uom = datos.uom.ToString();
                string material = datos.material.ToString().Contains("defecto") ? "Default" : datos.material.ToString();
                string proccess = datos.proccess.ToString();
                string orderId = datos.orderId.ToString();
                string area = datos.area.ToString();
                string phase = System.Text.Encoding.UTF8.GetString(System.Text.Encoding.GetEncoding("ISO-8859-8").GetBytes(datos.phase.ToString()));

                CURVAS_KOP_CFG_BREAD defBread = new CURVAS_KOP_CFG_BREAD();
                CURVAS_KOP_CFG curva = new CURVAS_KOP_CFG();

                curva.KopID = Convert.ToInt32(idkop);
                curva.Label = label;
                curva.Max_Value = max;
                curva.Min_Value = min;
                curva.UOM = uom;
                curva.OrderID = Convert.ToInt16(orderId);
                curva.Index = defBread.Select("", 0, 0, "{KopID} = " + idkop + " AND {Material} = '" + material + "' AND {OrderID} = " + orderId).ToList().Count + 1;
                curva.Phase = phase;
                curva.Area = area;
                curva.Proccess = proccess;
                curva.Material = material;

                ReturnValue ret = defBread.Create(curva);

                if (ret.succeeded)
                    return new ReturnValue(true);
                else
                    return new ReturnValue(false, -1, ret.message);
            }
            catch (Exception e)
            {
                return new ReturnValue(false, -1, e.Message);
            }
        }

        internal static ReturnValue ActivaCurva(dynamic datas)
        {
            try
            {
                String kopID = datas.KopID.ToString();
                String material = datas.Material.ToString();
                String value = datas.Value.ToString();

                CURVAS_KOP_DEF_BREAD defBread = new CURVAS_KOP_DEF_BREAD();
                CURVAS_KOP_DEF curva = new CURVAS_KOP_DEF();

                curva = defBread.Select("", 0, 0, "{KopID} = " + kopID + " AND {Material} = '" + (material.Contains("defecto") ? "Default" : material) + "' AND {OrderID} = -1").FirstOrDefault();

                curva.Enabled = value.Contains("True") ? 1 : 0;

                ReturnValue ret = defBread.Edit(curva);

                if (ret.succeeded)
                    return new ReturnValue(true, 0, ret.message);
                else
                    return new ReturnValue(false, -1, ret.message);

            }
            catch (Exception e)
            {
                return new ReturnValue(false, -1, e.Message);
            }

        }

        internal static ReturnValue borrarCFG(dynamic datas)
        {
            try
            {
                CURVAS_KOP_CFG_BREAD defBread = new CURVAS_KOP_CFG_BREAD();
                CURVAS_KOP_CFG curva = new CURVAS_KOP_CFG();
                List<CURVAS_KOP_CFG> etiquetas = new List<CURVAS_KOP_CFG>();

                String kopID = datas.KopID;
                String material = datas.Material;
                String label = datas.Label;
                int index;

                curva = defBread.Select("", 0, 0, "{KopID} =" + kopID + " AND {Material} = '" + material + "' And {Label} = '" + label + "' AND {OrderID} = -1").FirstOrDefault();
                index = curva.Index;

                ReturnValue ret = defBread.Delete(curva);

                if (ret.succeeded)
                {
                    //Se reajustan los índices
                    etiquetas = defBread.Select("", 0, 0, "{KopID} =" + kopID + " AND {Material} = '" + material + "' AND {OrderID} = -1 AND {Index} > " + index.ToString()).ToList();
                    foreach (var item in etiquetas)
                    {
                        item.Index -= 1;
                        defBread.Edit(item);
                    }
                    return new ReturnValue(true, 0, ret.message);
                }
                else
                    return new ReturnValue(false, -1, ret.message);

            }
            catch (Exception e)
            {
                return new ReturnValue(false, -1, e.Message);
            }
        }

        internal static List<CURVAS_KOP_DEF> GetKOPCurvasOrden(int idOrden)
        {
            try
            {
                CURVAS_KOP_VAL_BREAD valBread = new CURVAS_KOP_VAL_BREAD();
                CURVAS_KOP_DEF_BREAD defBread = new CURVAS_KOP_DEF_BREAD();
                CURVAS_KOP_DEF def = new CURVAS_KOP_DEF();
                List<CURVAS_KOP_DEF> listaCurvas = new List<CURVAS_KOP_DEF>();

                listaCurvas = defBread.Select("", 0, 0, string.Format("{{OrderID}}={0}", idOrden)).ToList();

                return listaCurvas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.GetKOPCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetKOPCurvasOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_LAS"));
            }
        }

        internal static List<KOP_GLOBAL> GetValCurvaOrden(int idKOP, int idOrden)
        {
            try
            {
                using (MESFabEntities context = new MESFabEntities())
                {
                    var kopMulti = context.KOPsMultivalor.AsNoTracking().FirstOrDefault(x => x.IdWO == idOrden && x.IdMaestroKOPMultivalor == idKOP).IdKOPMultivalor;

                    List<KOP_GLOBAL> list =  context.vListadoWOsKOPsMultivalorCoccion.AsNoTracking().Where(x => x.IdWO == idOrden && x.IdKOPMultivalor == kopMulti).ToList().Select(x =>
                    {
                        return new KOP_GLOBAL
                        {
                            PK = x.IdValorKOPMultivalor.ToString(),
                            NAME = x.DescKOP,
                            VALOR_MINIMO = x.ValorMin,
                            VALOR_MAXIMO = x.ValorMax,
                            VALOR = x.Valor,
                            MEDIDA = x.Unidad,
                            SEMAFORO = x.ColorEstadoValorKOP,
                            FILTRO_SEMAFORO = x.DescEstadoKOP,
                            DATATYPE = x.TipodatoMaestroKOP == "float" ? "Número" : "Texto",
                            INDEX = x.Posicion.ToString()
                        };
                    }).ToList();

                    return list;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetValCurvaOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_LAS"));
            }
        }

        internal static ReturnValue actualizarGridCurvas(dynamic datos)
        {
            try
            {


                int idWO = datos.items[0].PO;
                int idMulti = datos.items[0].PK;
                using (MESFabEntities context = new MESFabEntities())
                {
                    foreach (var item in datos.items)
                    {

                        int indice = item.Index;
                        string valor = item.Value;
                        var kopMulti = context.ValoresKOPsMultivalor.First(x => x.KOPsMultivalor.IdWO == idWO &&
                                                                                x.MaestroValoresKOPsMultivalor.Posicion == indice &&
                                                                                x.MaestroValoresKOPsMultivalor.IdMaestroKOPMultivalor == idMulti);
                        kopMulti.Valor = valor;
                        kopMulti.IdEstadoValorKOP = DefinirEstado(kopMulti, valor);
                    }
                    context.SaveChanges();

                }

                using (MESFabEntities context = new MESFabEntities())
                {

                    var kopPrincipal = context.KOPsMultivalor.FirstOrDefault(x => x.IdWO == idWO && x.IdMaestroKOPMultivalor == idMulti);

                    List<int> kopMultiAllEstados = context.ValoresKOPsMultivalor.Where(x => x.KOPsMultivalor.IdWO == idWO &&
                                                                                            x.MaestroValoresKOPsMultivalor.IdMaestroKOPMultivalor == idMulti)
                                                                                .Select(x => x.IdEstadoValorKOP).ToList();

                    int estadoMultiValorKOP = ObtenerEstado(kopMultiAllEstados);
                    kopPrincipal.IdEstadoKOP = estadoMultiValorKOP;
                    context.SaveChanges();

                    int estado = ObtenerEstado(context.KOPsMultivalor.Where(x => x.IdWO == idWO).Select(x => x.IdEstadoKOP).ToList());
                    string color = context.EstadosKOP.FirstOrDefault(x => x.IdEstadoKOP == estado).ColorEstadoKOP;
                    return new ReturnValue(true, null, color);
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.actualizarGridCurvas", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ActualizaFridCurvas", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ASIGNANDO_LOS"));
            }
        }

        private static int ObtenerEstado(List<int> kopMultiAllEstados)
        {
            int result;
            if (kopMultiAllEstados.Any(x => x == (int)TipoEstadosKOP.Inexistente))
                result = (int)TipoEstadosKOP.Inexistente;
            else if (kopMultiAllEstados.All(x => x == (int)TipoEstadosKOP.Bueno))
                result = (int)TipoEstadosKOP.Bueno;
            else
                result = (int)TipoEstadosKOP.Malo;
            return result;
        }

        private static int DefinirEstado(ValoresKOPsMultivalor objKOP, string valorparam)
        {
            var tipoValor = objKOP.MaestroValoresKOPsMultivalor.MaestroKOPsMultivalor.TipodatoMaestroKOP;
            int result = (int)TipoEstadosKOP.Inexistente;

            if (string.IsNullOrEmpty(valorparam))
                return (int)TipoEstadosKOP.Inexistente;

            if (string.IsNullOrEmpty(objKOP.ValorMax) || string.IsNullOrEmpty(objKOP.ValorMin))
                return (int)TipoEstadosKOP.Bueno;

            if (tipoValor == "dateime")
            {
                var valormin = DateTime.Parse(objKOP.ValorMin);
                var valormax = DateTime.Parse(objKOP.ValorMax);
                var valor = DateTime.Parse(valorparam);
                if (valormin <= valor && valor <= valormax)
                    result = (int)TipoEstadosKOP.Bueno;
                else
                    result = (int)TipoEstadosKOP.Malo;
            }
            else if (tipoValor == "float")
            {
                var valormin = float.Parse(objKOP.ValorMin.Replace('.', ','));
                var valormax = float.Parse(objKOP.ValorMax.Replace('.', ','));
                var valor = float.Parse(valorparam.Replace('.', ','));
                if (valormin <= valor && valor <= valormax)
                    result = (int)TipoEstadosKOP.Bueno;
                else
                    result = (int)TipoEstadosKOP.Malo;
            }
            else if (tipoValor == "int")
            {
                var valormin = int.Parse(objKOP.ValorMin);
                var valormax = int.Parse(objKOP.ValorMax);
                var valor = int.Parse(valorparam);
                if (valormin <= valor && valor <= valormax)
                    result = (int)TipoEstadosKOP.Bueno;
                else
                    result = (int)TipoEstadosKOP.Malo;
            }
            else if (tipoValor == "string")
            {
                result = (int)TipoEstadosKOP.Bueno;
            }
            return result;
        }

        internal static QueryResultGraficoFabUnEje ObtenerValorCurvaGrafico(int idKOP, int idOrden)
        {
            try
            {
                using (MESFabEntities context = new MESFabEntities())
                {
                    var dataRaw = context.ValoresKOPsMultivalor.AsNoTracking().Where(x => x.KOPsMultivalor.IdWO == idOrden && x.KOPsMultivalor.IdMaestroKOPMultivalor == idKOP).OrderBy(x => x.MaestroValoresKOPsMultivalor.Posicion)
                        .Select(x => new
                        {
                            x.MaestroValoresKOPsMultivalor.DescValorKOP,
                            x.MaestroValoresKOPsMultivalor.Posicion,
                            x.ValorMin,
                            x.ValorMax,
                            x.Valor,
                        }).ToList();

                    var dataField = dataRaw.Select(x => x.DescValorKOP + " - Posición " + x.Posicion).ToList();
                    var valorData = new SeriesFabUnEje { data = dataRaw.Select(x => x.Valor).ToList(), name = "Valor" };
                    var valorMaxData = new SeriesFabUnEje { data = dataRaw.Select(x => x.ValorMax).ToList(), name = "Valor maximo" };
                    var valorMinData = new SeriesFabUnEje { data = dataRaw.Select(x => x.ValorMin).ToList(), name = "Valor minimo" };
                    var series = new List<SeriesFabUnEje>() { valorData, valorMaxData, valorMinData };

                    return new QueryResultGraficoFabUnEje { Fields = dataField, series = series };
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ObtenerValorCurvaGrafico", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_KOPS_DE_LAS_CURVAS"));
            }
        }

        internal static bool ActualizaNombreCurva(dynamic datos)
        {
            CURVAS_KOP_DEF kop = new CURVAS_KOP_DEF();
            try
            {
                String kopID = datos.KopID.ToString();
                String material = datos.Material.ToString();

                CURVAS_KOP_DEF_BREAD defBread = new CURVAS_KOP_DEF_BREAD();
                kop = defBread.Select("", 0, 0, "{KopID} = '" + kopID + "' AND {Material} = '" + material + "' AND {OrderID} = -1").FirstOrDefault();
                if (kop != null)
                {
                    kop.Name = datos.nombre.ToString();
                    defBread.Edit(kop);
                    return true;
                }
                else
                    return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        internal static bool consultaNombreCurva(dynamic datos)
        {
            try
            {
                string nombre = datos.Name.ToString();
                string fase = datos.Phase.ToString();

                CURVAS_KOP_DEF_BREAD defBread = new CURVAS_KOP_DEF_BREAD();

                Collection<CURVAS_KOP_DEF> curva = defBread.Select("", 0, 0, "{Name}='" + nombre + "' AND {Phase}='" + fase + "'");

                if (curva.Count > 0)
                    return false;
                else
                    return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        internal async Task<bool> crearMultiValorKOP(dynamic datos)
        {
            try
            {
                string valor = datos.valor.ToString();
                string kop = datos.kop.ToString();
                DateTime fecha = DateTime.Parse(datos.fecha.ToString());
                string orden = datos.orden.ToString();

                KOP_GLOBAL _newKOP = new KOP_GLOBAL()
                {
                    ID_ORDEN = orden,
                    NAME = kop,
                    VALOR = valor.ToString(),
                    FECHA = fecha.Date.ToString(),
                    VALOR_MAXIMO = string.Empty,
                    VALOR_MINIMO = string.Empty
                };

                ReturnValue ret = await InsertKopOrder(_newKOP);
                return ret.succeeded;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.crearMultiValorKOP", e.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.CrearMultivalorKOP", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AGREGANDO_UN"));
            }
        }

        internal static List<KOPs_FAB_MultiValor> GetMultiValor(int codKOP)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    //La vista MES_MSM_Fab.dbo.KOPs_Planta_FAB ha de ser añadida a EF
                    List<KOPs_FAB_MultiValor> listaKOPS = context.KOPs_FAB_MultiValor.AsNoTracking().Where(m => m.Cod_KOP == codKOP && m.PkActVal > 0).ToList();
                    List<KOPs_FAB_MultiValor> lista_nueva = new List<KOPs_FAB_MultiValor>();
                    
                    foreach (KOPs_FAB_MultiValor item in listaKOPS)
                    {

                        KOPs_FAB_MultiValor kop = new KOPs_FAB_MultiValor();
                        kop.Cod_KOP = item.Cod_KOP;
                        kop.Cod_Orden = item.Cod_Orden;
                        kop.Cod_Procedimiento = item.Cod_Procedimiento;
                        kop.Des_KOP = item.Des_KOP;
                        kop.Fecha = item.Fecha;
                        kop.FechaUTC = item.FechaUTC;
                        kop.ID_KOP = item.ID_KOP;
                        kop.ID_Orden = item.ID_Orden;
                        kop.ID_Procedimiento = item.ID_Procedimiento;
                        kop.Obligatorio = item.Obligatorio;
                        kop.PkActVal = item.PkActVal;
                        kop.Sequence_KOP = item.Sequence_KOP;
                        kop.Sequence_Procedimiento = item.Sequence_Procedimiento;
                        kop.Tipo_KOP = item.Tipo_KOP;
                        kop.TipoKOP = item.TipoKOP;
                        kop.UOM_KOP = item.UOM_KOP;
                        kop.Valor_Actual = item.Tipo_KOP.Equals("float") && !String.IsNullOrEmpty(item.Valor_Actual) ? Math.Round(Convert.ToDecimal(item.Valor_Actual), 2).ToString() : item.Valor_Actual;
                        kop.Valor_Maximo = item.Tipo_KOP.Equals("float") && !String.IsNullOrEmpty(item.Valor_Maximo) ? Math.Round(Convert.ToDecimal(item.Valor_Maximo), 2).ToString() : item.Valor_Maximo;
                        kop.Valor_Minimo = item.Tipo_KOP.Equals("float") && !String.IsNullOrEmpty(item.Valor_Minimo) ? Math.Round(Convert.ToDecimal(item.Valor_Minimo), 2).ToString() : item.Valor_Minimo;

                        lista_nueva.Add(kop);
                    }

                    return lista_nueva;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetMultivalor", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_MULTIVALOR"));
            }
        }

        public async Task<ReturnValue> borrarMultiValorKOP(int pkKOP)
        {
            var uri = string.Concat(_urlKop, "MultivalueDelete", "?id=", pkKOP);
            var _ret = await ApiClient.DeleteAsync<HttpResponseMessage>(uri);
            return await _ret.Content.ReadAsAsync<ReturnValue>();
        }

        internal async Task<bool> editaMultiValorKOP(dynamic datos)
        {
            try
            {
                string ValorKOP = datos.ValorKOP.ToString();
                int PkActVal = int.Parse(datos.PkActVal.ToString());
                DateTime fecha = DateTime.Parse(datos.Fecha.ToString());

                DTO_MultivalorKOP _dtoFabricacion = new DTO_MultivalorKOP()
                {
                    Id = PkActVal,
                    Value = ValorKOP,
                    Date = fecha
                };
                _urlProcessParameter = string.Concat(_urlProcessParameter, "ProcessSegment");
                var result = await ApiClient.PutAsJsonAsync(_urlProcessParameter, _dtoFabricacion);
                ReturnValue ret = await result.Content.ReadAsAsync<ReturnValue>();

                if (!ret.succeeded)
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ret.message, "DAO_KOP.EditaMultivalorKOP", "WEB-FABRICACION", "Sistema");

                return ret.succeeded;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.editaMultiValorKOP", e.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.EditaMultivalorKOP", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_EDITANDO_UN"));
            }
        }

        internal static List<KOPs_FAB_Historian> getKOPSHistorian(int idOrden, int idProc)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    List<KOPs_FAB_Historian> listaKOPS = context.KOPs_FAB_Historian.AsNoTracking().Where(m => m.Cod_Orden == idOrden && m.Cod_Procedimiento == idProc).ToList();
                    return listaKOPS;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.GetKOPSHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_HISTORIAN"));
            }
        }

        //Esta función devolverá los NewId o los alias de las tags
        internal static String GetTagValue(SqlConnection conexion, String whereClausure, String scannedText, int getValues)
        {
            object value;
            using (SqlCommand getTagValue = new SqlCommand())
            {
                try
                {
                    getTagValue.Connection = conexion;
                    getTagValue.CommandTimeout = 180;
                    getTagValue.CommandType = CommandType.StoredProcedure;
                    getTagValue.CommandText = "GetTagValue";
                    getTagValue.Parameters.AddWithValue("@whereClausure", whereClausure);
                    getTagValue.Parameters.AddWithValue("@scannedText", scannedText);
                    getTagValue.Parameters.AddWithValue("@getValues", getValues);
                    //SqlParameter outValue = new SqlParameter("@value", SqlDbType.NVarChar) { Direction = ParameterDirection.Output };
                    //getTagValue.Parameters.Add(outValue);                                        
                    value = getTagValue.ExecuteScalar();
                    return value.ToString();
                    //outValue.ToString();
                }
                catch
                {
                    return null;
                }
            }
        }

        //Se utiliza para rellenar el gridHistorian de VerDetalleOrden
        private static void SetHistorianGrid(SqlDataReader dr, MSM.Models.Envasado.QueryResult pivot, Dictionary<String, String> kopDescrip)
        {
            pivot.Fields = new List<string>();
            pivot.Types = new List<string>();
            pivot.Records = new List<Hashtable>();
            String kop = String.Empty, auxField = String.Empty;
            ProductSegmentParameter_BREAD pdefBread = new ProductSegmentParameter_BREAD();
            ProductSegmentParameter pdefParameter = new ProductSegmentParameter();

            for (int i = 0; i < dr.FieldCount; i++)
            {
                kop = dr.GetName(i);
                if (!kop.Equals("RowUpdated"))
                    pdefParameter = pdefBread.Select("", 0, 0, "{Name} ='" + dr.GetName(i) + "'").FirstOrDefault();

                auxField = kop.Equals("RowUpdated") ? kop : pdefParameter.Description;
                kopDescrip.Add(kop, auxField);

                pivot.Fields.Add(kop);
                pivot.Types.Add(dr.GetDataTypeName(i));
            }

            while (dr.Read())
            {
                Hashtable record = new Hashtable();
                foreach (string field in pivot.Fields)
                {
                    if (field.Equals("RowUpdated"))
                        record[field] = DateTime.Parse(dr[field].ToString()).ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss");
                    else
                        record[field] = decimal.Parse(dr[field].ToString()).ToString("0.##").ToString();
                }
                pivot.Records.Add(record);
            };
        }

        //Procedimiento sobrecargado para que acepte varios Cod_KOP
        internal static List<Object> ObtenerGridHistorian(dynamic parameters)
        {
            try
            {
                string kopsCod = parameters.Cod_Kops.ToString();
                int idOrden = int.Parse(parameters.Id_Orden.ToString());
                int checkOrden = int.Parse(parameters.Operacion.ToString());
                Dictionary<String, String> kopDescript = new Dictionary<string, string>();
                List<KOPs_FAB_Historian> KOP = new List<KOPs_FAB_Historian>();
                //Proceso la trama para quedarme con los valores de los Cod_KOP seleccionados desde el portal
                List<String> kopsCodList = (kopsCod.Replace("Cod_KOP=", "").Replace('&', ' ').Replace(' ', ',').Trim()).Split(',').ToList<String>();
                //Esta variable se inicializará con los Id_KOP devueltos por la consulta de esta función.                
                String whereClausure = String.Empty;
                String scannedText = String.Empty;

                using (MESEntities context = new MESEntities())
                {
                    //La vista MES_MSM_Fab.dbo.KOPs_Planta_FAB ha de ser añadida a EF
                    KOP = context.KOPs_FAB_Historian.AsNoTracking().Where(m => m.Cod_Orden == idOrden && kopsCodList.Contains(m.Cod_KOP.ToString())).OrderBy(m => m.Cod_KOP).ToList<KOPs_FAB_Historian>();
                }

                if (KOP.Count != 0)
                {
                    double fechaIni = 0;
                    double fechaFin = 0;
                    DateTime origin = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
                    DateTime ahora = DateTime.Now.ToUniversalTime();
                    TimeSpan diffAhora = ahora - origin;
                    MSM.Models.Envasado.QueryResult pivot = new MSM.Models.Envasado.QueryResult();

                    if (KOP[0].ID_Procedimiento.Contains("Orden") || checkOrden == 1)
                    {
                        Ordenes_FAB orden = new Ordenes_FAB();
                        using (MESEntities context = new MESEntities())
                        {
                            orden = context.Ordenes_FAB.AsNoTracking().Where(m => m.Cod_Orden == idOrden).FirstOrDefault();
                        }
                        fechaIni = (orden.Tiempo_Inicio_RealUTC.Value - origin).TotalSeconds;
                        fechaFin = String.IsNullOrEmpty(orden.Tiempo_Fin_RealUTC.ToString()) ? diffAhora.TotalSeconds : (orden.Tiempo_Fin_RealUTC.Value - origin).TotalSeconds;
                    }
                    else
                    {
                        Procedimiento_FAB proc = new Procedimiento_FAB();
                        using (MESEntities context = new MESEntities())
                        {
                            //El valor se tiene que sacar en una variable porque sino EntityFramework toma el 
                            //array entero y produce una excepción
                            int procedimientoCod = KOP[0].Cod_Procedimiento;
                            proc = context.Procedimiento_FAB.AsNoTracking().Where(m => m.Cod_Procedimiento == procedimientoCod).FirstOrDefault();
                        }

                        fechaIni = String.IsNullOrEmpty(proc.Tiempo_InicioUTC.ToString()) ? -1 : (proc.Tiempo_InicioUTC.Value - origin).TotalSeconds;
                        fechaFin = String.IsNullOrEmpty(proc.Tiempo_FinUTC.ToString()) ? diffAhora.TotalSeconds : (proc.Tiempo_FinUTC.Value - origin).TotalSeconds;

                    }

                    List<DTO_GridHistorian> result = new List<DTO_GridHistorian>();

                    //Creo la clausula Where para el procedimiento MES_ObtenerValoresHistorianByList_FAB
                    KOP.ForEach(item => whereClausure += " [TagName] like '%" + item.ID_KOP + "' OR");
                    //Elimino el último OR
                    whereClausure = whereClausure.Substring(0, whereClausure.Length - 3);
                    //Se cambian las ' por '' para que desde el whereClausure se obtenga el nombre de la tag. Este campo es necesario para 
                    //el correcto funcionamiento del procedimiento almacenado GetTagValu                    
                    scannedText = whereClausure.Replace("'", "''");

                    using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                    {
                        SqlDataReader dr = null;
                        conexion.Open();

                        using (SqlCommand comando = new SqlCommand())
                        {
                            comando.Connection = conexion;
                            comando.CommandTimeout = 180;
                            comando.CommandType = CommandType.StoredProcedure;
                            comando.CommandText = "[dbo].[MES_ObtenerValoresHistorianByList_FAB]";

                            comando.Parameters.AddWithValue("@nombreKOP", whereClausure);
                            comando.Parameters.AddWithValue("@fechaini", Math.Truncate(fechaIni).ToString());
                            comando.Parameters.AddWithValue("@fechafin", Math.Truncate(fechaFin).ToString());
                            comando.Parameters.AddWithValue("@pivotValues", GetTagValue(conexion, whereClausure, scannedText, 1));
                            comando.Parameters.AddWithValue("@pivotSelect", GetTagValue(conexion, whereClausure, scannedText, 0));

                            try
                            {
                                dr = comando.ExecuteReader();
                                //Esta función variará dependiendo desde donde se llame ObtenerGridHistorian
                                SetHistorianGrid(dr, pivot, kopDescript);
                            }
                            catch (Exception ex)
                            {
                                conexion.Close();
                                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ObtenerGridHistorian", "WEB-FABRICACION", "Sistema");
                                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRID"));
                            }
                        }
                    }
                    List<Object> aux = new List<Object>();
                    aux.Add(pivot);
                    aux.Add(kopDescript);
                    return aux;
                }
                else
                    return null;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ObtenerGridHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRID"));
            }
        }

        private static void SetHistorianChart(SqlDataReader dr, QueryResultGraficoFab pivot, int idOrden)
        {
            SeriesFab serie = null;
            List<String> nombres = new List<String>();
            List<int> axisCrossingValues = new List<int>();
            EjeYGráfico axes = null;
            CategoryAxis categoriesAxis = null;
            KOPs_FAB_Historian tag = new KOPs_FAB_Historian();
            KOPs_FAB_Historian auxTag = new KOPs_FAB_Historian();
            String tagName, localDateTime;

            using (MESEntities context = new MESEntities())
            {
                tagName = dr.GetName(1);
                tag = context.KOPs_FAB_Historian.AsNoTracking().Where(kop => kop.Cod_Orden == idOrden && kop.ID_KOP.Equals(tagName)).FirstOrDefault();

                serie = new SeriesFab
                {
                    name = tag != null ? tag.Des_KOP + "&" + tag.UOM_KOP : dr.GetName(1),
                    data = new List<string>(),
                    type = "line",
                    axis = tag != null ? tag.Des_KOP : dr.GetName(1),
                    color = "",
                    categoryAxis = tag != null ? tag.Des_KOP + " UoM - " + tag.UOM_KOP : dr.GetName(1)
                };

                categoriesAxis = new CategoryAxis
                {
                    name = tag != null ? tag.Des_KOP + " UoM - " + tag.UOM_KOP : dr.GetName(1),
                    categories = new List<String>()
                };


                while (dr.Read())
                {
                    localDateTime = DateTime.Parse(dr["RowUpdated"].ToString()).ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss");

                    if (!nombres.Exists(element => element.Equals(localDateTime)))
                    {
                        nombres.Add(localDateTime);
                    }

                    auxTag = context.KOPs_FAB_Historian.AsNoTracking().Where(kop => kop.Cod_Orden == idOrden && kop.Des_KOP.Equals(serie.axis)).FirstOrDefault();
                    serie.data.Add(decimal.Parse(dr[auxTag.ID_KOP].ToString()).ToString("0.##").Replace(',', '.'));
                }
            }

            categoriesAxis.categories = nombres;

            axes = new EjeYGráfico { name = serie.name.Split('&')[0], color = serie.color, min = tag.Valor_Minimo, max = tag.Valor_Maximo, title = new Title { text = tag.UOM_KOP } };

            serie.name = serie.name.Replace("&", " UoM - ");
            pivot.series.Add(serie);
            pivot.axes.Add(axes);
            pivot.step = 1;//recordNumber / 20;
            pivot.categories.Add(categoriesAxis);
        }

        //Procedimiento sobrecargado para que acepte varios Cod_KOP
        internal static QueryResultGraficoFab ObtenerGraficoHistorian(dynamic parameters)
        {
            try
            {
                string kopsCod = parameters.Cod_Kops.ToString();
                int idOrden = int.Parse(parameters.Id_Orden.ToString());
                int checkOrden = int.Parse(parameters.Operacion.ToString());
                List<KOPs_FAB_Historian> KOP = new List<KOPs_FAB_Historian>();
                //Proceso la trama para quedarme con los valores de los Cod_KOP seleccionados desde el portal
                List<String> kopsCodList = kopsCod.Replace("Cod_KOP=", "").Replace('&', ' ').Replace(' ', ',').Trim().Split(',').ToList<String>();
                //Esta variable se inicializará con los Id_KOP devueltos por la consulta de esta función.
                String whereClausure = String.Empty;
                String scannedText = String.Empty;

                String[] colors = { "#2E8B57", "#2F4F4F", "#32CD32", "#40E0D0", "#00508B", "#0000AF", "#006400", "#008000", "#008080", "#008B8B", "#00CED1", "#00FA9A", "#00FF00", "#00FF7F", "#00FFFF", "#00FFFF", "#20B2AA", "#228B22" };
                int colorsNumber = 0;
                int kopsNumber = 0;

                using (MESEntities context = new MESEntities())
                {
                    //La vista MES_MSM_Fab.dbo.KOPs_Planta_FAB ha de ser añadida a EF
                    KOP = context.KOPs_FAB_Historian.AsNoTracking().Where(m => m.Cod_Orden == idOrden && kopsCodList.Contains(m.Cod_KOP.ToString())).OrderBy(m => m.Cod_KOP).ToList<KOPs_FAB_Historian>();
                }

                if (KOP.Count != 0)
                {
                    double fechaIni = 0;
                    double fechaFin = 0;
                    DateTime origin = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
                    DateTime ahora = DateTime.Now.ToUniversalTime();
                    TimeSpan diffAhora = ahora - origin;
                    QueryResultGraficoFab pivot = new QueryResultGraficoFab();

                    if (KOP[0].ID_Procedimiento.Contains("Orden") || checkOrden == 1)
                    {
                        Ordenes_FAB orden = new Ordenes_FAB();
                        using (MESEntities context = new MESEntities())
                        {
                            orden = context.Ordenes_FAB.AsNoTracking().Where(m => m.Cod_Orden == idOrden).FirstOrDefault();
                        }

                        fechaIni = (orden.Tiempo_Inicio_RealUTC.Value - origin).TotalSeconds;
                        fechaFin = String.IsNullOrEmpty(orden.Tiempo_Fin_RealUTC.ToString()) ? diffAhora.TotalSeconds : (orden.Tiempo_Fin_RealUTC.Value - origin).TotalSeconds;
                    }
                    else
                    {
                        Procedimiento_FAB proc = new Procedimiento_FAB();
                        using (MESEntities context = new MESEntities())
                        {
                            //El valor se tiene que sacar en una variable porque sino EntityFramework toma el 
                            //array entero y produce una excepción
                            int procedimientoCod = KOP[0].Cod_Procedimiento;
                            proc = context.Procedimiento_FAB.AsNoTracking().Where(m => m.Cod_Procedimiento == procedimientoCod).FirstOrDefault();
                        }

                        fechaIni = String.IsNullOrEmpty(proc.Tiempo_InicioUTC.ToString()) ? -1 : (proc.Tiempo_InicioUTC.Value - origin).TotalSeconds;
                        fechaFin = String.IsNullOrEmpty(proc.Tiempo_FinUTC.ToString()) ? diffAhora.TotalSeconds : (proc.Tiempo_FinUTC.Value - origin).TotalSeconds;

                    }

                    List<DTO_GridHistorian> result = new List<DTO_GridHistorian>();

                    ////Creo la clausula Where para el procedimiento MES_ObtenerValoresHistorianByList_FAB
                    //KOP.ForEach(item => whereClausure += " [TagName] like '%" + item.ID_KOP + "%' OR");
                    ////Elimino el último OR
                    // whereClausure = whereClausure.Substring(0, whereClausure.Length - 3);                    

                    using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                    {
                        SqlDataReader dr = null;

                        KOP.ForEach(item =>
                        {
                            whereClausure = " [TagName] like '%" + item.ID_KOP + "' ";
                            //Se cambian las ' por '' para que desde el whereClausure se obtenga el nombre de la tag. Este campo es necesario para 
                            //el correcto funcionamiento del procedimiento almacenado GetTagValu                    
                            scannedText = whereClausure.Replace("'", "''");
                            conexion.Open();
                            using (SqlCommand comando = new SqlCommand())
                            {
                                comando.Connection = conexion;
                                comando.CommandTimeout = 180;
                                comando.CommandType = CommandType.StoredProcedure;
                                comando.CommandText = "[dbo].[MES_ObtenerValoresHistorianByList_FAB]";

                                comando.Parameters.AddWithValue("@nombreKOP", whereClausure);
                                comando.Parameters.AddWithValue("@fechaini", Math.Truncate(fechaIni).ToString());
                                comando.Parameters.AddWithValue("@fechafin", Math.Truncate(fechaFin).ToString());
                                comando.Parameters.AddWithValue("@pivotValues", GetTagValue(conexion, whereClausure, scannedText, 1));
                                comando.Parameters.AddWithValue("@pivotSelect", GetTagValue(conexion, whereClausure, scannedText, 0));

                                try
                                {
                                    dr = comando.ExecuteReader();
                                    if (dr.HasRows)
                                    {
                                        SetHistorianChart(dr, pivot, idOrden);
                                        pivot.series[kopsNumber].color = colors[colorsNumber];
                                        pivot.axes[kopsNumber].color = colors[colorsNumber];
                                        kopsNumber++;
                                        colorsNumber = colorsNumber >= colors.Length ? 0 : colorsNumber + 1;
                                    }

                                }
                                catch (Exception ex)
                                {
                                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ObtenerGraficoHistorian", "WEB-FABRICACION", "Sistema");
                                    throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRID"));
                                }
                                finally
                                {
                                    conexion.Close();
                                }
                            }
                        });
                    }
                    return pivot;
                }
                else
                    return null;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ObtenerGraficoHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRID"));
            }
        }

        internal static List<DTO_GridHistorian> ObtenerGridHistorian(int idKOP, int idOrden, int checkOrden)
        {
            try
            {
                KOPs_FAB_Historian KOP = new KOPs_FAB_Historian();

                using (MESEntities context = new MESEntities())
                {
                    //La vista MES_MSM_Fab.dbo.KOPs_Planta_FAB ha de ser añadida a EF
                    KOP = context.KOPs_FAB_Historian.AsNoTracking().Where(m => m.Cod_Orden == idOrden && m.Cod_KOP == idKOP).FirstOrDefault();
                }

                double fechaIni = 0;
                double fechaFin = 0;
                DateTime origin = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
                DateTime ahora = DateTime.Now.ToUniversalTime();
                TimeSpan diffAhora = ahora - origin;

                if (KOP.ID_Procedimiento.Contains("Orden") || checkOrden == 1)
                {
                    Ordenes_FAB orden = new Ordenes_FAB();
                    using (MESEntities context = new MESEntities())
                    {
                        orden = context.Ordenes_FAB.AsNoTracking().Where(m => m.Cod_Orden == idOrden).FirstOrDefault();
                    }

                    fechaIni = (orden.Tiempo_Inicio_RealUTC.Value - origin).TotalSeconds;
                    fechaFin = String.IsNullOrEmpty(orden.Tiempo_Fin_RealUTC.ToString()) ? diffAhora.TotalSeconds : (orden.Tiempo_Fin_RealUTC.Value - origin).TotalSeconds;
                }
                else
                {
                    Procedimiento_FAB proc = new Procedimiento_FAB();
                    using (MESEntities context = new MESEntities())
                    {
                        proc = context.Procedimiento_FAB.AsNoTracking().Where(m => m.Cod_Procedimiento == KOP.Cod_Procedimiento).FirstOrDefault();
                    }

                    fechaIni = String.IsNullOrEmpty(proc.Tiempo_InicioUTC.ToString()) ? -1 : (proc.Tiempo_InicioUTC.Value - origin).TotalSeconds;
                    fechaFin = String.IsNullOrEmpty(proc.Tiempo_FinUTC.ToString()) ? diffAhora.TotalSeconds : (proc.Tiempo_FinUTC.Value - origin).TotalSeconds;

                }

                List<DTO_GridHistorian> result = new List<DTO_GridHistorian>();

                using (SqlConnection conexion = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    SqlDataReader dr = null;

                    using (SqlCommand comando = new SqlCommand())
                    {
                        comando.Connection = conexion;
                        comando.CommandTimeout = 180;
                        comando.CommandType = CommandType.StoredProcedure;
                        comando.CommandText = "[dbo].[MES_ObtenerValoresHistorian_FAB]";

                        comando.Parameters.AddWithValue("@nombreKOP", KOP.ID_KOP);
                        comando.Parameters.AddWithValue("@fechaini", fechaIni);
                        comando.Parameters.AddWithValue("@fechafin", fechaFin);

                        try
                        {
                            conexion.Open();
                            dr = comando.ExecuteReader();

                            while (dr.Read())
                            {
                                DTO_GridHistorian dto = new DTO_GridHistorian();

                                dto.estado = dr["Status"].ToString();
                                dto.fechaEntero = int.Parse(dr["Time"].ToString());
                                dto.id = int.Parse(dr["TagID"].ToString());
                                dto.milisegundo = int.Parse(dr["Msec"].ToString());
                                dto.nombre = KOP.Des_KOP;
                                dto.tipo = dr["Tipo"].ToString();
                                dto.valor = dr["Value"].ToString();
                                dto.fechaAct = DateTime.Parse(dr["RowUpdated"].ToString());

                                result.Add(dto);
                            }
                        }
                        catch (Exception ex)
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ObtenerGridHistorian", "WEB-FABRICACION", "Sistema");
                            throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRID"));
                        }
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ObtenerGridHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRID"));
            }
        }

        internal static QueryResultGraficoFab ObtenerGraficoHistorian(int idKOP, int idOrden, int checkOrden)
        {
            try
            {
                QueryResultGraficoFab result = new QueryResultGraficoFab();
                List<DTO_GridHistorian> listaValores = ObtenerGridHistorian(idKOP, idOrden, checkOrden);

                List<String> valores = new List<String>();
                List<SeriesFab> serie = new List<SeriesFab>();
                List<String> nombres = new List<String>();

                for (int i = 0; i < listaValores.Count; i++)
                {
                    if (!nombres.Exists(element => element.Equals(listaValores[i].fechaAct.ToString())))
                    {
                        nombres.Add(listaValores[i].fechaAct.ToString());
                    }

                    valores.Add(listaValores[i].valor);
                }

                serie.Add(new SeriesFab { name = "Valor", data = valores });

                result.Fields = nombres;
                result.series = serie;

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ObtenerGraficoHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRAFICO_DE"));
            }
        }

        internal static List<Procedimiento> ObtenerProcedimientosHistorian(int idOrden)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    List<KOPs_FAB_Historian> listaKOPS = context.KOPs_FAB_Historian.AsNoTracking().Where(m => m.Cod_Orden == idOrden).ToList();
                    List<Procedimiento> procList = listaKOPS.GroupBy(c => c.Cod_Procedimiento).Select(c => new Procedimiento()
                    {
                        Cod_Procedimiento = c.FirstOrDefault().Cod_Procedimiento,
                        ID_Procedimiento = c.FirstOrDefault().ID_Procedimiento
                    }).ToList();

                    return procList;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ObtenerProcedimientosHistorian", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_HISTORIAN"));
            }
        }

        internal static string ObtenerSemaforoMultivalor(int pkKop)
        {
            List<KOPs_FAB_MultiValor> listaKops = new List<KOPs_FAB_MultiValor>();
            using (MESEntities context = new MESEntities())
            {
                listaKops = context.KOPs_FAB_MultiValor.AsNoTracking().Where(c => c.Cod_KOP == pkKop).ToList();
            }

            string color = "Verde";

            if (listaKops.Count <= 0)
                return "Azul";
            else
            {
                foreach (KOPs_FAB_MultiValor kop in listaKops)
                {
                    if (kop.Valor_Maximo.Equals(String.Empty) && kop.Valor_Minimo.Equals(String.Empty))
                        return color;
                    else
                    {
                        float val = float.Parse(kop.Valor_Actual);

                        if (kop.Valor_Maximo.Equals(String.Empty))
                        {
                            //Max vacio, solo comparar con min
                            float min = float.Parse(kop.Valor_Minimo);

                            if (val < min)
                                return "Rojo";
                        }
                        else
                            if (kop.Valor_Minimo.Equals(String.Empty))
                        {
                            //Comparar con max
                            float max = float.Parse(kop.Valor_Maximo);

                            if (val > max)
                                return "Rojo";
                        }
                        else
                        {
                            float max = float.Parse(kop.Valor_Maximo);
                            float min = float.Parse(kop.Valor_Minimo);

                            if ((val > max) || (val < min))
                                return "Rojo";
                        }
                    }
                }

            }

            return color;
        }

        internal static QueryResultGraficoFabUnEje ObtenerMultiValorGrafico(int pkKop)
        {
            try
            {
                QueryResultGraficoFabUnEje result = new QueryResultGraficoFabUnEje();
                List<KOPs_FAB_MultiValor> listaValores = GetMultiValor(pkKop);

                List<String> valores = new List<String>();
                List<String> valoresMax = new List<String>();
                List<String> valoresMin = new List<String>();
                List<SeriesFabUnEje> serie = new List<SeriesFabUnEje>();
                List<String> nombres = new List<String>();

                for (int i = 0; i < listaValores.Count; i++)
                {
                    if (!nombres.Exists(element => element.Equals(listaValores[i].Fecha.ToString())))
                    {
                        nombres.Add(listaValores[i].Fecha.ToString());
                    }

                    valores.Add(listaValores[i].Valor_Actual);
                    valoresMax.Add(string.IsNullOrEmpty(listaValores[i].Valor_Maximo) ? "0" : listaValores[i].Valor_Maximo);
                    valoresMin.Add(string.IsNullOrEmpty(listaValores[i].Valor_Minimo) ? "0" : listaValores[i].Valor_Minimo);
                }

                serie.Add(new SeriesFabUnEje { name = "Valor", data = valores });
                serie.Add(new SeriesFabUnEje { name = "Valor_Maximo", data = valoresMax });
                serie.Add(new SeriesFabUnEje { name = "Valor_Minimo", data = valoresMin });


                result.Fields = nombres;
                result.series = serie;

                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_KOP.ObtenerGraficoHistorian", e.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_KOP.ObtenerMultiValorGrafico", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_EL_GRAFICO_DE"));
            }
        }

        internal static String GetKopName(String condition)
        {
            ProductSegmentParameter_BREAD psp_Bread = new ProductSegmentParameter_BREAD();
            ProductSegmentParameter psp = psp_Bread.Select("", 0, 0, condition).FirstOrDefault();
            return psp != null ? psp.Name : String.Empty;
        }

        private async Task<ReturnValue> InsertKopOrder(KOP_GLOBAL newKop)
        {

            var uri = string.Concat(_urlKop, "InsertKOPOrder");
            var _ret = await ApiClient.PostAsJsonAsync(uri, newKop);
            return await _ret.Content.ReadAsAsync<ReturnValue>();
        }

        public async Task<List<DTO_ZonaKOPs>> ObtenerZonasKOPsPorTipoOrden(int IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<List<DTO_ZonaKOPs>>(UriBaseFabricacion + "api/Zona/ObtenerZonasKOPsPorTipoOrden/?IdTipoOrden=" + IdTipoOrden);
            return ret;
        }

        public async Task<List<DTO_MostosCoccion>> ObtenerMostosPorZonaTipo(string IdZona, string IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<List<DTO_MostosCoccion>>(UriBaseFabricacion + "api/KOP/ObtenerMostosPorZonaTipo?IdZona=" + IdZona + "&IdTipoOrden=" + IdTipoOrden);
            return ret;
        }

        public async Task<List<DTO_KOPs_Config>> ObtenerKOPsPorZonaTipo(string IdZona, string IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<List<DTO_KOPs_Config>>(UriBaseFabricacion + "api/KOP/ObtenerKOPsPorZonaTipo?IdZona=" + IdZona + "&IdTipoOrden=" + IdTipoOrden);
            return ret;
        }

        public async Task<List<DTO_KOPs_Config>> ObtenerKopsPorZonaTipoIdMaterial(string IdZona, string IdTipoOrden, string IdMaterial)
        {
            var ret = await _api.GetPostsAsync<List<DTO_KOPs_Config>>(UriBaseFabricacion + $"api/KOP/ObtenerKopsPorZonaTipoIdMaterial/{IdZona}/{IdTipoOrden}/{IdMaterial}");
            return ret;
        }

        public async Task<List<DTO_KOPs_Config>> ObtenerKOPSMostosPorZonaMostoTipoOrden(string IdZona, string IdMosto, string IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<List<DTO_KOPs_Config>>(UriBaseFabricacion + "api/KOP/ObtenerKOPSMostosPorZonaMostoTipoOrden?IdZona=" + IdZona + "&IdMosto=" + IdMosto + "&IdTipoOrden=" + IdTipoOrden);
            return ret;
        }

        public async Task<List<DTO_KOPs_Config>> ObtenerKOPSMostosPorZonaMostoTipoOrdenImportarPorMaterial(string IdZona, string IdMosto, string IdTipoOrden)
        {
            var ret = await _api.GetPostsAsync<List<DTO_KOPs_Config>>(UriBaseFabricacion + "api/KOP/ObtenerKOPSMostosPorZonaMostoTipoOrdenImportarPorMaterial?IdZona=" + IdZona + "&IdMosto=" + IdMosto + "&IdTipoOrden=" + IdTipoOrden);
            return ret;
        }

        public async Task<bool> ActualizarKopsPorDefecto(DTO_KOPs_Config datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(UriBaseFabricacion + "api/KOP/ActualizarKopsPorDefecto", datos);
            return ret;
        }
        public async Task<bool> ActualizarKopsPorMostos(DTO_KOPs_Config datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(UriBaseFabricacion + "api/KOP/ActualizarKopsPorMostos", datos);
            return ret;
        }

        public async Task<bool> ImportarKOPSPorDefectoPorZona(DTO_ImportarKOPs Datos)
        {
            var ret = await _api.PostPostsAsync<dynamic>(Datos, UriBaseFabricacion + "api/KOP/ImportarKOPSPorDefectoPorZona");
            return ret;
        }
        public async Task<bool> ImportarKOPSMostosPorZonaListaMostos(DTO_ImportarKOPs Datos)
        {
            var ret = await _api.PostPostsAsync<dynamic>(Datos, UriBaseFabricacion + "api/KOP/ImportarKOPSPorDefectoAMostos");
            return ret;
        }

        public async Task<bool> ImportarKOPSPorMaterial(DTO_ImportarKOPs Datos)
        {
            var ret = await _api.PostPostsAsync<dynamic>(Datos, UriBaseFabricacion + "api/KOP/ImportarKOPSPorMaterial");
            return ret;
        }

        public async Task<string> ObtenerEstadoKOPDetalleOrden(string IdOrden)
        {
            var ret = await _api.GetPostsAsync<string>(UriBaseFabricacion + "api/KOP/ObtenerEstadoKOPDetalleOrden?IdOrden=" + IdOrden);
            return ret;
        }

        public async Task<string> ObtenerEstadoKOPMultivalorDetalleOrden(string IdOrden)
        {
            var ret = await _api.GetPostsAsync<string>(UriBaseFabricacion + "api/KOP/ObtenerEstadoKOPMultivalorDetalleOrden?IdOrden=" + IdOrden);
            return ret;
        }

        public async Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorDetalleOrden(string IdOrden)
        {
            var ret = await _api.GetPostsAsync<List<KOP_GLOBAL>>(UriBaseFabricacion + "api/KOP/ObtenerListadoKOPsMultivalorDetalleOrden?IdOrden=" + IdOrden);
            return ret;
        }

        public async Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorExpandidoDetalleOrden(string IdOrden, string idKOP)
        {
            var ret = await _api.GetPostsAsync<List<KOP_GLOBAL>>(UriBaseFabricacion + "api/KOP/ObtenerListadoKOPsMultivalorExpandidoDetalleOrden?IdOrden=" + IdOrden + "&idKOP=" + idKOP);
            return ret;
        }

        public async Task<List<KOP_GLOBAL>> ObtenerListadoMaestroKOPsMultivalorPorZonaTipo(string IdZona, string IdTipo)
        {
            var ret = await _api.GetPostsAsync<List<KOP_GLOBAL>>(UriBaseFabricacion + "api/KOP/ObtenerListadoMaestroKOPsMultivalorPorZonaTipo?IdZona=" + IdZona + "&IdTipo=" + IdTipo);
            return ret;
        }
        public async Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipo(string IdZona, string IdKOP, string IdTipoSubProceso, string IdTipo)
        {
            var ret = await _api.GetPostsAsync<List<KOP_GLOBAL>>(UriBaseFabricacion + "api/KOP/ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipo?IdZona=" + IdZona + "&IdKOP=" + IdKOP + "&IdTipoSubProceso=" + IdTipoSubProceso + "&IdTipo=" + IdTipo);
            return ret;
        }

        public async Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorPorZonaTipoMosto(string IdZona, string IdTipo, string IdMosto)
        {
            var ret = await _api.GetPostsAsync<List<KOP_GLOBAL>>(UriBaseFabricacion + "api/KOP/ObtenerListadoKOPsMultivalorPorZonaTipoMosto?IdZona=" + IdZona + "&IdTipo=" + IdTipo + "&IdMosto=" + IdMosto);
            return ret;
        }
        public async Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipoMosto(string IdZona, string IdKOP, string IdTipoSubProceso, string IdTipo, string IdMosto)
        {
            var ret = await _api.GetPostsAsync<List<KOP_GLOBAL>>(UriBaseFabricacion + "api/KOP/ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipoMosto?IdZona=" + IdZona + "&IdKOP=" + IdKOP + "&IdTipoSubProceso=" + IdTipoSubProceso + "&IdTipo=" + IdTipo + "&IdMosto=" + IdMosto);
            return ret;
        }
        public async Task<List<DTO_TiposKOPsMultivalor>> ObtenerListadoTiposKOPsMultivalor()
        {
            var ret = await _api.GetPostsAsync<List<DTO_TiposKOPsMultivalor>>(UriBaseFabricacion + "api/KOP/ObtenerListadoTiposKOPsMultivalor");
            return ret;
        }
        public async Task<bool> ValidarNumeroKOPMultivalorSubProceso(int NKOPMultivalor, int IdTipoSubProceso,int TipoKOP)
        {
            var ret = await _api.GetPostsAsync<dynamic>(UriBaseFabricacion + "api/KOP/ValidarNumeroKOPMultivalorSubProceso?NKOPMultivalor=" + NKOPMultivalor + "&IdTipoSubProceso=" + IdTipoSubProceso + "&TipoKOP=" + TipoKOP);
            return ret;
        }
        public async Task<bool> ActualizarNumeroKOPTipoKOPMultivalor(dynamic Datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(UriBaseFabricacion + "api/KOP/ActualizarNumeroKOPTipoKOPMultivalor",Datos);
            return ret;
        }

        public async Task<bool> BorradoLogicoKOPMultivalor(dynamic Datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(UriBaseFabricacion + "api/KOP/BorradoLogicoKOPMultivalor", Datos);
            return ret;
        }

        public async Task<bool> BorradoLogicoKOPMultivalorPosicion(dynamic Datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(UriBaseFabricacion + "api/KOP/BorradoLogicoKOPMultivalorPosicion", Datos);
            return ret;
        }
        public async Task<int> ObtenerMaximoNumeroPosicionSegunMosto(int IdKOPMultivalor, int IdSubProceso, string IdMosto, int IdZona, int IdTipo)
        {
            var ret = await _api.GetPostsAsync<int>(UriBaseFabricacion + "api/KOP/ObtenerMaximoNumeroPosicionSegunMosto?IdKOPMultivalor=" + IdKOPMultivalor + "&IdSubProceso=" + IdSubProceso + "&IdMosto=" + IdMosto + "&IdZona=" + IdZona + "&IdTipoOrden=" + IdTipo);
            return ret;
        }

        public async Task<bool> CrearPosicionKopMultivalor(DTO_KOPs_Config Datos)
        {
            var ret = await _api.PostPostsAsync<dynamic>(Datos, UriBaseFabricacion + "api/KOP/CrearPosicionKopMultivalor");
            return ret;
        }

        public async Task<bool> ActualizarPosicionKOPMultivalor(DTO_KOPs_Config Datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(UriBaseFabricacion + "api/KOP/ActualizarPosicionKOPMultivalor", Datos);
            return ret;
        }

        public async Task<bool> ImportarKOPSMultivalorPorDefectoAMostos(DTO_ImportarKOPs Datos)
        {
            var ret = await _api.PostPostsAsync<dynamic>(Datos,UriBaseFabricacion + "api/KOP/ImportarKOPSMultivalorPorDefectoAMostos");
            return ret;
        }

        public async Task<List<DTO_CodigoKOP>> ObtenerKOPSPorTipoWO(int idTipoWO)
        {
            var ret = await _api.GetPostsAsync<List<DTO_CodigoKOP>>(UriBaseFabricacion + "api/KOP/KOPSPorTipoWO?idTipoWO=" + idTipoWO);
            return ret;
        }

        public async Task<List<DTO_ConfiguracionCapturaKOPSLIMS>> ObtenerConfiguracionCapturaKOPSLIMS()
        {
            var ret = await _api.GetPostsAsync<List<DTO_ConfiguracionCapturaKOPSLIMS>>(UriBaseFabricacion + "api/KOP/ConfiguracionCapturaKOPSLIMS");
            return ret;
        }

        public async Task<bool> InsertarCapturaKOPSLIMS(DTO_ConfiguracionCapturaKOPSLIMS datos)
        {
            var ret = await _api.PostPostsAsync<dynamic>(datos, UriBaseFabricacion + "api/KOP/CapturaKOPSLIMS");

            return ret;
        }

        public async Task<bool> ActualizarCapturaKOPSLIMS(DTO_ConfiguracionCapturaKOPSLIMS datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(UriBaseFabricacion + "api/KOP/CapturaKOPSLIMS", datos);

            return ret;
        }

        public async Task<bool> EliminarCapturaKOPSLIMS(int idConfig)
        {
            var result = await _api.DeletePostsAsync<bool>(string.Concat(UriBaseFabricacion + "api/KOP/CapturaKOPSLIMS", "?idConfig=", idConfig));

            return result;
        }

        public async Task<string> CrearPlantillasKOPsMaterial(string idMosto, string idZona, int idTipoWO, string tipoKOPs)
        {
            var result = await _api.PostPostsAsync<string>("", string.Concat(UriBaseFabricacion + "api/KOP/CrearPlantillasKOPsMaterial", "?idMosto=", idMosto, "&idZona=", idZona, "&idTipoWO=", idTipoWO, "&tipoKOPs=", tipoKOPs));

            return result;
        }
    }
}