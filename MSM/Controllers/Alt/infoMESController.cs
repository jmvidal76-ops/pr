using MSM.BBDD.Alt;
using MSM.Controllers.Planta;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace MSM.Controllers.Alt
{
    public class infoMESController : ApiController
    {
        /// <summary>
        /// Obtiene toda la información para consultar en los formularios
        /// Sólo obtienes las ultimas 100 órdenes  ( más no es necesario) y los últimos 20 turnos
        /// /// /// </summary>
        /// <returns>Lista de nombres de los usuarios</returns>      TemplatesForms 
        [HttpGet]
        [Route("api/getInfoMES/")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM,
                      Funciones.CEL_3_GestionFormulariosActivosCELPortal, Funciones.SEM_3_GestionFormulariosActivosSEMPortal,
                      Funciones.CEL_12_GestionHistoricoCEL, Funciones.SEM_10_GestionHistoricoSEM,
                      Funciones.CEL_5_GestionFormulariosActivosCELTerminal, Funciones.SEM_5_GestionFormulariosActivosSEMTerminal)]
        public object getInfoMES()
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                List<object> lStatusALT = new List<object>();
                List<object> lLocationsID = new List<object>();
                List<object> lTiposOrdenes = new List<object>();
                List<object> lOrdenesID = new List<object>();
                List<object> lTiposTurnos = new List<object>();
                List<object> lSHCIDs = new List<object>();
                List<object> lMaterials = new List<object>();
                List<object> lotsIDs = new List<object>();
                var fechaDesde = DateTime.Now.AddDays(-60);
                context.Configuration.ProxyCreationEnabled = false;
                //--//
                lLocationsID.AddRange(context.SIT_Locations.AsNoTracking().Select(t => t.LocPath).Distinct());
                //--//
                lTiposOrdenes.AddRange(context.SIT_Orders_Types.AsNoTracking().Select(t => new { text = t.id == null ? "" : t.id, value = t.id == null ? "" : t.id }).Distinct());
                lOrdenesID.AddRange(context.SIT_Orders.AsNoTracking().Where(t => t.FecHorAct > fechaDesde).OrderByDescending(t => t.Id).Select(t => t.Id == null ? "" : t.Id));
                //--//
                lTiposTurnos.AddRange(context.SIT_SHC_Turnos.AsNoTracking().Select(t => new { text = t.Turno == null ? "" : t.Turno, value = t.IdTipoTurno == null ? "" : t.IdTipoTurno }).Distinct());
                lSHCIDs.AddRange(context.SIT_SHC_Turnos.AsNoTracking().Where(t => t.Fecha > fechaDesde).Select(t => t.Id.ToString()));
                //--//
                lMaterials.AddRange(context.SIT_Materiales.AsNoTracking().Select(t => t.Nombre).Distinct());
                lotsIDs.AddRange(context.SIT_Lots.AsNoTracking().Where(t => t.CreatedOn > fechaDesde).Select(t => t.LotID == null ? "" : t.LotID));
                //--//
                lStatusALT.AddRange(context.Status.AsNoTracking().ToList().Select(t => new { text = IdiomaController.GetResourceName(t.ID.ToString()), value = t.ID }));

                return new { lLocationsID, lTiposOrdenes, lOrdenesID, lTiposTurnos, lSHCIDs, lMaterials, lotsIDs, lStatusALT };
            }
        }

        /// <summary>
        /// Comprueba el campo especial que se le pasa si el valor existe data = { value: , type }
        /// </summary>
        [HttpPost]
        [Route("api/checkCampoEspecial/")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM,
                      Funciones.CEL_3_GestionFormulariosActivosCELPortal, Funciones.SEM_3_GestionFormulariosActivosSEMPortal,
                      Funciones.CEL_12_GestionHistoricoCEL, Funciones.SEM_10_GestionHistoricoSEM)]
        public bool checkCampoEspecial(dynamic data)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    switch ((string)data.type)
                    {
                        case "turnoId":
                            var tipot = (string)data.value;
                            return context.SIT_TiposTurno.AsNoTracking().Where(o => o.id == tipot).Count() > 0;
                        case "orderId":
                            var val = (string)data.value;
                            return context.SIT_Orders.AsNoTracking().Where(o => o.Id == val).Count() > 0;
                        case "orderTypeId":
                            var ordertype = (string)data.value;
                            return context.SIT_Orders_Types.AsNoTracking().Where(o => o.id == ordertype).Count() > 0;
                        case "shcId":
                            var shc = (int)data.value;
                            return context.SIT_SHC_Turnos.AsNoTracking().Where(o => o.Id == shc).Count() > 0;
                        case "lotId":
                            var lot = (string)data.value;
                            return context.SIT_Lots.AsNoTracking().Where(o => o.LotID == lot).Count() > 0;
                        case "materialId":
                            var material = (string)data.value;
                            return context.SIT_Materiales.AsNoTracking().Where(o => o.IdMaterial == material).Count() > 0;
                        case "location":
                            var location = (string)data.value;
                            return context.SIT_Locations.AsNoTracking().Where(o => o.LocPath == location).Count() > 0;
                        default:
                            return true;
                    }
                }
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Obtiene toda la información para consultar en la página de Runtime
        /// /// /// </summary>
        /// <returns>Lista de nombres de los usuarios</returns>      TemplatesForms 
        [HttpGet]
        [Route("api/getInfoMESFilters/")]
        [ApiAuthorize(Funciones.CEL_4_VisualizacionFormulariosActivosCELPortal, Funciones.SEM_4_VisualizacionFormulariosActivosSEMPortal,
                      Funciones.CEL_13_VisualizacionHistoricoCEL, Funciones.SEM_11_VisualizacionHistoricoSEM)]
        public object getInfoMESFilters()
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                List<object> lLocationsID = new List<object>();
                List<object> lTiposOrdenes = new List<object>();
                List<object> lOrdenesID = new List<object>();
                List<object> lTiposTurnos = new List<object>();
                List<object> lSHCIDs = new List<object>();
                List<object> lMaterials = new List<object>();
                List<object> lotsIDs = new List<object>();
                context.Configuration.ProxyCreationEnabled = false;
                //--//
                lLocationsID.AddRange(context.SIT_Locations.AsNoTracking().Select(t => t.LocPath).Distinct());
                //--//
                lTiposOrdenes.AddRange(context.SIT_Orders_Types.AsNoTracking().Select(t => new { text = t.id == null ? "" : t.id, value = t.id == null ? "" : t.id }).Distinct());
                lOrdenesID.AddRange(context.FormsMESData.AsNoTracking().Select(t => t.orderId == null ? "" : t.orderId).Distinct().OrderByDescending(Id => Id));
                //--//
                lTiposTurnos.AddRange(context.SIT_SHC_Turnos.AsNoTracking().Select(t => new { text = t.Turno == null ? "" : t.Turno, value = t.IdTipoTurno == null ? "" : t.IdTipoTurno }).Distinct());
                lSHCIDs.AddRange(context.FormsMESData.AsNoTracking().Select(t => t.shcId == null ? "" : t.shcId).Distinct());
                //--//
                lMaterials.AddRange(context.SIT_Materiales.AsNoTracking().Select(t => t.Nombre).Distinct());
                lotsIDs.AddRange(context.FormsMESData.AsNoTracking().Select(t => t.lotId == null ? "" : t.lotId).Distinct());
                //--//
                lTiposTurnos.Add(new { text = "", value = "" });
                lTiposOrdenes.Add(new { text = "", value = "" });

                return new { lLocationsID, lTiposOrdenes, lOrdenesID, lTiposTurnos, lSHCIDs, lMaterials, lotsIDs };
            }
        }
    }
}