using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using MSM.BBDD.Model;
using MSM.Security;
using MSM.DTO;
using System.Threading.Tasks;
using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.BBDD;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class AccionesMejoraArranquesController : ApiController
    {
        private readonly IDAO_AccionMejora _iDAOAccionMejora;

        public AccionesMejoraArranquesController(IDAO_AccionMejora iDAOAccionMejora)
        {
            _iDAOAccionMejora = iDAOAccionMejora;
        }

        [Route("api/GetAccionesMejoraArranque")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_28_GestionSintesisDeArranque)]
        public List<DTO_OrdenesArranques> GetAccionesMejoraArranque(dynamic datos)
        {
            List<OrdenesArranque> arranques = new List<OrdenesArranque>();
            using (MESEntities context = new MESEntities())
            {
                context.Configuration.ProxyCreationEnabled = false;
                arranques = context.OrdenesArranque.AsNoTracking().OrderByDescending(p => p.InicioReal).ToList();
            }
            
            string linea = datos.linea.Value.ToString();
            string idTipoTurno = datos.idTipoTurno.Value.ToString();

            arranques.All(o =>
            {
                o.ProductoEntrante = o.ProductoEntrante == null ? string.Empty : string.Join(" ", o.ProductoEntrante.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                o.InicioReal = o.InicioReal.HasValue ? o.InicioReal.Value.AddMilliseconds(-o.InicioReal.Value.Millisecond) : o.InicioReal;
                return true;
            });

            if (datos.fechaTurno == null)
            {
                if (idTipoTurno == string.Empty)
                {
                    arranques = arranques.Where(p => p.IdLinea == linea).ToList();
                }
                else
                {
                    arranques = arranques.Where(p => p.IdLinea == linea && p.TipoTurnoId == idTipoTurno).ToList();
                }
            }
            else
            {
                DateTime fechaTurno = ((DateTime)datos.fechaTurno.Value).ToLocalTime();

                if (idTipoTurno == string.Empty)
                {
                    arranques = arranques.Where(p => p.IdLinea == linea && p.FechaTurno == fechaTurno).ToList();
                }
                else
                {
                    arranques = arranques.Where(p => p.IdLinea == linea && p.FechaTurno == fechaTurno && p.TipoTurnoId == idTipoTurno).ToList();
                }
            }

            List<DTO_OrdenesArranques> lstArranques = ObtenerDtoArranques(arranques);

            return lstArranques;
        }

        [Route("api/GetOrdenesArranque")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_31_VisualizacionOrdenesArranque)]
        public List<DTO_OrdenesArranques> GetOrdenesArranque(dynamic datos)
        {
            try
            {
                DAO_AccionMejora daoAccionMejora = new DAO_AccionMejora();

                List<DTO_OrdenesArranques> arranques = daoAccionMejora.ObtenerOrdenesArranque(datos);

                return arranques;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraArranquesController.GetOrdenesArranque", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ORDENES_ARRANQUE"));
            }
        }

        [Route("api/OrdenesArranque")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_31_VisualizacionOrdenesArranque,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<IHttpActionResult> ObtenerOrdenesArranqueFiltro(string idLinea, int idTipoTurno, DateTime fechaTurno)
        {
            try
            {
                var result = await _iDAOAccionMejora.ObtenerAccionMejoraArranquesFiltro(idLinea, idTipoTurno, fechaTurno);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraArranquesController.ObtenerOrdenesArranqueFiltro", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_ARRANQUES"));

            }
        }

        private static List<DTO_OrdenesArranques> ObtenerDtoArranques(List<OrdenesArranque> arranques)
        {
            List<TIPOS_ARRANQUE> tiposArranques = new List<TIPOS_ARRANQUE>();
            using (MESEntities context = new MESEntities())
            {
                tiposArranques = context.TIPOS_ARRANQUE.AsNoTracking().ToList();
            }

            List<DTO_OrdenesArranques> lstArranques = arranques.Join(tiposArranques, oa => oa.TipoArranque, ta => Convert.ToInt32(ta.ID_ARRANQUE), (oa, ta) => new
            {
                oa,
                ta
            }).Select(ot => new DTO_OrdenesArranques()
            {
                DescripcionLinea = ot.oa.DescripcionLinea,
                EstadoAct = ot.oa.EstadoAct,
                FechaTurno = ot.oa.FechaTurno,
                Id = ot.oa.Id,
                ID_ARRANQUE = ot.oa.ID_ARRANQUE,
                IdLinea = ot.oa.IdLinea,
                IDProductoEntrante = ot.oa.IDProductoEntrante,
                InicioReal = ot.oa.InicioReal,
                InicioUTC = ot.oa.InicioUTC,
                Linea = ot.oa.Linea,
                MinutosFinal1 = ot.oa.MinutosFinal1,
                MinutosFinal2 = ot.oa.MinutosFinal2,
                MinutosObjetivo1 = ot.oa.MinutosObjetivo1,
                MinutosObjetivo2 = ot.oa.MinutosObjetivo2,
                ProductoEntrante = ot.oa.ProductoEntrante,
                TipoArranque = ot.oa.TipoArranque,
                TipoTurno = ot.oa.TipoTurno,
                TipoTurnoId = ot.oa.TipoTurnoId,
                DESC_ARRANQUE = ot.ta.DESC_ARRANQUE,
                NumLineaDescripcion = ot.oa.NumLineaDescripcion,
                IndicadorLlenadora = ot.oa.IndicadorLlenadora,
                IndicadorPaletizadora = ot.oa.IndicadorPaletizadora,
                TiempoPreactor = ot.oa.TiempoPreactor
            }).ToList();

            return lstArranques;
        }
    }
}