using Common.Models.Fabricacion.Coccion;
using MSM.BBDD.Fabricacion;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;

namespace MSM.Controllers.Fabricacion
{
    [Authorize]
    public class ParametrosFabController : ApiController
    {
        private readonly IDAO_ParametrosFabricacion _ParametrosFabricacion;

        public ParametrosFabController(IDAO_ParametrosFabricacion ParametrosFabricacion)
        {
            _ParametrosFabricacion = ParametrosFabricacion;
        }


        [Route("api/ParametrosFabricacion/ObtenerParametrosFabricacionPorTipoOrden/{IdTipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_13_VisualizacionParametrosFabricacion, Funciones.FAB_PROD_RES_13_GestionParametrosFabricacion)]
        public async Task<List<ParametrosFabricacionDto>> ObtenerParametrosFabricacionPorTipoOrden(int IdTipoOrden)
        {            
            try
            {
                var result = await _ParametrosFabricacion.ObtenerParametrosFabricacionPorTipoOrden(IdTipoOrden);

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParametrosFabController.ObtenerParametrosFabricacionPorTipoOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PARAMETROS_FABRICACION"));
            }
        }

        [Route("api/ParametrosFabricacion/ObtenerMaestroParametrosFabricacionPorTipoOrden/{IdTipoOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_13_VisualizacionParametrosFabricacion, Funciones.FAB_PROD_RES_13_GestionParametrosFabricacion)]
        public async Task<List<MaestroParametrosFabricacionDto>> ObtenerMaestroParametrosFabricacionPorTipoOrden(int IdTipoOrden)
        {
            try
            {
                var result = await _ParametrosFabricacion.ObtenerMaestroParametrosFabricacionPorTipoOrden(IdTipoOrden);

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParametrosFabController.ObtenerMaestroParametrosFabricacionPorTipoOrden", "WEB-FABRICACION", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_PARAMETROS_FABRICACION"));
            }
        }

        [Route("api/ParametrosFabricacion/CrearParametroFabricacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_13_GestionParametrosFabricacion)]
        public async Task<bool> CrearParametroFabricacion([FromBody] ParametrosFabricacionDto Parametro)
        {
            var resultados = new List<string>();

            try
            {
                var result = await _ParametrosFabricacion.CrearParametroFabricacion(Parametro);

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParametrosFabController.CrearParametroFabricacion", "WEB-FABRICACION", "Sistema");
                return false;
            }
        }

        [Route("api/ParametrosFabricacion/ActualizarParametroFabricacion")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_13_GestionParametrosFabricacion)]
        public async Task<bool> ActualizarParametroFabricacion([FromBody] ParametrosFabricacionDto Parametro)
        {
            var resultados = new List<string>();

            try
            {
                var result = await _ParametrosFabricacion.ActualizarParametroFabricacion(Parametro);

                return result;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParametrosFabController.ActualizarParametroFabricacion", "WEB-FABRICACION", "Sistema");
                return false;
            }
        }

        [Route("api/ParametrosFabricacion/EliminarParametrosFabricacion")]
        [HttpDelete]
        [ApiAuthorize(Funciones.FAB_PROD_RES_13_GestionParametrosFabricacion)]
        public async Task<List<string>> EliminarParametrosFabricacion([FromBody] List<int> ids)
        {
            var resultados = new List<string>();

            try
            {
                if (ids == null || ids.Count == 0)
                {
                    resultados.Add("No se han proporcionado IDs para eliminar.");
                    return resultados;
                }

                foreach (var id in ids)
                {
                    var result = await _ParametrosFabricacion.EliminarParametroFabricacion(id);

                    if (!result)
                    {
                        resultados.Add($"Error al eliminar el parámetro con Id {id}");
                    }
                }

                if (resultados.Count ==  0)
                {
                    resultados.Add("Parámetros eliminados exitosamente.");
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ParametrosFabController.EliminarParametrosFabricacion", "WEB-FABRICACION", "Sistema");
                resultados.Add("Error en la eliminación: " + ex.Message);
            }

            return resultados;
        }

    }
}