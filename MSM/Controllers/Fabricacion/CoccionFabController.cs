using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using MSM.Utilidades;
using MSM.BBDD.Planta;
using MSM.BBDD.Model;
using System.Threading.Tasks;

namespace MSM.Controllers.Fabricacion
{
    public class CoccionFabController : ApiController
    {
        /// <summary>
        /// Obtiene los silos de recepción de malta
        /// </summary>
        /// <returns></returns>
        [Route("api/GetEquiposCoccion/{nombreSalaCoccion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_Coccion)]
        public async Task<List<Equipo>> GetEquiposCoccion(int nombreSalaCoccion)
        {
            try
            {
                List<Equipo> listEquipos = new List<Equipo>();

                string idPlanta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];
                string idCoccion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Coccion.GetProperty("value"));
                //string idSalaCoccion = string.Format("{0}.{1}", idCoccion, nombreSalaCoccion);

                Site site = await Site.CreateAsync(idPlanta);

                List<Area> coccion = await site.GetAreas();
                if (coccion.Count > 0)
                {
                    Area areaCoccion = coccion.Find(a => a.EquipoSit.ID.ToUpper().Equals(idCoccion.ToUpper()));
                    if (areaCoccion != null)
                    {
                        List<Celda> salasCoccion = await areaCoccion.GetCeldas();
                        if (salasCoccion.Count > 0)
                        {
                            Celda salaCoccion = salasCoccion.Find(c => c.EquipoSit.PK == nombreSalaCoccion);
                            listEquipos = salaCoccion.GetEquipos().OrderBy(m => m.id).ToList();
                        }
                    }
                }

                return listEquipos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "CoccionFabController.GetEquiposCoccion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "CoccionFabController.GetEquiposCoccion", "WEB-FABRICACION", "Sistema");
                throw ex;
            }

        }

        /// <summary>
        /// Obtiene la salas de cocción
        /// </summary>
        /// <returns></returns>
        [Route("api/GetSalaCoccion/{Area}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_Coccion)]
        public async Task<IEnumerable<object>> GetSalaCoccion(string Area)//string salaCoccion
        {
            try
            {
                IEnumerable<object> result = null;

                string idPlanta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];
                string idCoccion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Coccion.GetProperty("value"));


                Site site = await Site.CreateAsync(idPlanta);

                List<Area> areasAcoccion = await site.GetAreas();
                if(areasAcoccion.Count > 0)
                {
                    Area coccion = areasAcoccion.Find(a => a.EquipoSit.ID.ToUpper().Equals(idCoccion.ToUpper()));
                    List<Celda> listSalasCoccion = await coccion.GetCeldas();
                    if (listSalasCoccion.Count > 0)
                    {
                        result = listSalasCoccion.Where(c => c.EquipoSit.ClassID.Equals("MSM-EQUIPAMIENTO-FABRICACION.CELDA-SALA-COCCION")).Select(c => new
                        //listSalasCoccion = coccion.GetCeldas().Select(c => new
                        {
                            c.EquipoSit.Name,
                            c.EquipoSit.PK
                        }).ToList();
                    }
                }
                //listSalasCoccion = coccion.GetCeldas().Where(c => c.NombreDescripcion != null).Select(c => new
                
                return result;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "CoccionFabController.GetSalaCoccion", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "CoccionFabController.GetSalaCoccion", "WEB-FABRICACION", "Sistema");
                throw ex;
            }

        }


        /// <summary>
        /// Obtiene la salas de cocción
        /// </summary>
        /// <returns></returns>
        [Route("api/GetAreasGenerico/{Area}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_Coccion)]
        public async Task<IEnumerable<object>> GetAreasGenerico(string Area)//string salaCoccion
        {
            try
            {
                IEnumerable<object> listSalasCoccion = null;

                string idPlanta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];
                string idCoccion = "";

                switch (Area)
                {
                    case "COC":
                        idCoccion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Coccion.GetProperty("value"));
                        break;
                    case "REC":
                        idCoccion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Recepcion.GetProperty("value"));
                        break;
                    case "FER":
                        idCoccion = string.Format("{0}.{1}", idPlanta, AreaFabricacion.Fermentacion.GetProperty("value"));
                        break;
                }

                Site site = await Site.CreateAsync(idPlanta);

                List<Area> areasCoccion = await site.GetAreas();
                if(areasCoccion.Count > 0)
                {
                    Area coccion = areasCoccion.Find(a => a.EquipoSit.ID.ToUpper().Equals(idCoccion.ToUpper()));
                    using (MESEntities context = new MESEntities())
                    {
                        listSalasCoccion = context.Celda_FAB.AsNoTracking().Where(m => m.AreaPK == coccion.EquipoSit.PK).OrderBy(c => c.Posicion).ToList();
                    }
                }
               

                return listSalasCoccion;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "CoccionFabController.GetAreasGenerico", "WEB-FABRICACION", "Sistema");
                throw ex;
            }
        }
    }
}