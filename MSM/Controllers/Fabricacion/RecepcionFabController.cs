using MSM.BBDD.Fabricacion;
using MSM.BBDD.Planta;
using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using MSM.RealTime;
using MSM.Security;
using MSM.Utilidades;
using Siemens.Brewing.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Http;


namespace MSM.Controllers.Fabricacion
{
    public class RecepcionFabController : ApiController
    {
        /// <summary>
        /// Obtiene los silos de recepción de malta
        /// </summary>
        /// <returns></returns>
        //[Route("api/GetSilos")]
        //[HttpGet]
        //[ApiAuthorize(Funciones.FAB_PROD_RES_3_Silos)]
        //public List<List<SiloMalta>> GetSilos()
        //{
        //    try
        //    {
        //        List<List<SiloMalta>> lstSilos = new List<List<SiloMalta>>();
                
        //        string idPlanta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];
        //        string idRecepcion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Silos.GetProperty("value"));
        //        string idMalta = string.Format("{0}.{1}", idRecepcion, CeldaFabricacion.Malta.GetProperty("value"));

        //        Site site = new Site(idPlanta);
                
        //        Area recepcion = site.GetAreas().Find(a => a.EquipoSit.ID == idRecepcion);
        //        Celda malta = recepcion.GetCeldas().Find(c => c.EquipoSit.ID == idMalta);
        //        List<SiloMalta> listEquipos = malta.GetEquipos<SiloMalta>();

        //        IEnumerable<string> tiposSilos = listEquipos.Select(s => s.Tipo).Distinct();

        //        foreach (string tipo in tiposSilos)
        //        {
        //            List<SiloMalta> list = listEquipos.Where(s => s.Tipo == tipo).ToList();
        //            lstSilos.Add(list);
        //        }
        //        return lstSilos;
        //    }
        //    catch (Exception ex)
        //    {
        //        DAO_Log.registrarLog(DateTime.Now, "RecepcionFabController.GetSilos", ex, HttpContext.Current.User.Identity.Name);
        //        throw ex;
        //    }

        //}

        [Route("api/GetEquiposSilos/{area}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_3_Silos)]
        public List<Silo> GetEquiposSilos(string area)
        {
            try
            {
                return DAO_Equipo.GetEquiposSilos(area);
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "RecepcionFabController.GetSilos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "RecepcionFabController.GetEquiposSilos", "WEB-FABRICACION", "Sistema");
                throw ex;
            }

        }
    }
}