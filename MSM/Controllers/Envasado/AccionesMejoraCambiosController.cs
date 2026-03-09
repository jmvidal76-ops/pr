using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using MSM.BBDD;
using MSM.BBDD.Envasado;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Security;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class AccionesMejoraCambiosController : ApiController
    {
        private readonly IDAO_AccionMejora _iDAOAccionMejora;

        public AccionesMejoraCambiosController(IDAO_AccionMejora iDAOAccionMejora)
        {
            _iDAOAccionMejora = iDAOAccionMejora;
        }

        [Route("api/GetAccionesMejoraCambios")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_25_GestionSintesisDeCambio)]
        public List<OrdenesCambio> GetAccionesMejoraCambios(dynamic datos)
        {
            List<OrdenesCambio> cambios = new List<OrdenesCambio>();

            using (MESEntities context = new MESEntities())
            {
                context.Configuration.ProxyCreationEnabled = false;
                cambios = context.OrdenesCambio.AsNoTracking().ToList();
            }
            
            string linea = datos.linea.Value.ToString();
            string idTipoTurno = datos.idTipoTurno.Value.ToString();
            
            cambios.All(o => 
            {
                o.ProductoEntrante = o.ProductoEntrante == null ? string.Empty : string.Join(" ", o.ProductoEntrante.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                o.ProductoSaliente = o.ProductoSaliente == null ? string.Empty : string.Join(" ", o.ProductoSaliente.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
                o.InicioReal = o.InicioReal.HasValue ? o.InicioReal.Value.AddMilliseconds(-o.InicioReal.Value.Millisecond) : o.InicioReal;
                return true; 
            });

            cambios = cambios.OrderByDescending(p=> p.InicioReal).ToList();

            if (datos.fechaTurno == null)
            {
                if (idTipoTurno == string.Empty)
                {
                    cambios = cambios.Where(p => p.IdLinea == linea).ToList();
                }
                else
                {
                    cambios = cambios.Where(p => p.IdLinea == linea && p.TipoTurnoId == idTipoTurno).ToList();
                }
            }
            else
            {
                DateTime fechaTurno = ((DateTime)datos.fechaTurno.Value).ToLocalTime();

                if (idTipoTurno == string.Empty)
                {
                    cambios = cambios.Where(p => p.IdLinea == linea && p.FechaTurno == fechaTurno).ToList();
                }
                else
                {
                    cambios = cambios.Where(p => p.IdLinea == linea && p.FechaTurno == fechaTurno && p.TipoTurnoId == idTipoTurno).ToList();
                }
            }

            return cambios;
        }

        [Route("api/GetOrdenesCambio")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_27_VisualizacionOrdenesCambio)]
        public List<OrdenesCambio> GetOrdenesCambio(dynamic datos)
        {
            try
            {
                DAO_AccionMejora daoAccionMejora = new DAO_AccionMejora();

                List<OrdenesCambio> cambios = daoAccionMejora.ObtenerOrdenesCambio(datos);

                return cambios;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraCambiosController.GetOrdenesCambio", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_ORDENES_CAMBIO"));
            }
        }

        [Route("api/OrdenesCambio")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_27_VisualizacionOrdenesCambio,
            Funciones.ENV_PROD_EXE_49_VisualizacionParteRelevoTurno)]
        public async Task<IHttpActionResult> ObtenerOrdenesCambioFiltro(string idLinea, int idTipoTurno, DateTime fechaTurno)
        {
            try
            {
                var result = await _iDAOAccionMejora.ObtenerAccionMejoraCambiosFiltro(idLinea, idTipoTurno, fechaTurno);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "AccionesMejoraCambiosController.ObtenerOrdenesCambioFiltro", "WEB-ENVASADO", "Sistema");

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENIENDO_CAMBIOS"));

            }
        }
    }
}