using Common.Models.Fabricacion;
using Common.Models.Material;
using MSM.BBDD.Planta;
using MSM.BBDD.Trazabilidad.Fabricacion;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Models.Fabricacion;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace MSM.Controllers.Fabricacion
{
    [Authorize]
    public class PlantillaConsumoMMPPController : ApiController
    {
        private readonly IDAO_PlantillaConsumosMMPP _IDAO_PlantillaConsumosMMPP;

        public PlantillaConsumoMMPPController(IDAO_PlantillaConsumosMMPP iDAO_PlantillaConsumosMMPP)
        {
            _IDAO_PlantillaConsumosMMPP = iDAO_PlantillaConsumosMMPP;
        }

        /// <summary>
        /// Método que obtiene las plantillas de consumos de mmpp
        /// </summary>
        /// <returns></returns>
        [Route("api/plantillaConsumoMMPP/ObtenerPlantillasConsumosMMPP")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_VisualizacionConsumosMMPP,Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<List<PlantillaConsumoMMPP_DTO>> ObtenerPlantillasConsumosMMPP()
        {
            try
            {
               return await _IDAO_PlantillaConsumosMMPP.ObtenerPlantillasConsumosMMPP();
      
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ObtenerPlantillasConsumosMMPP", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/plantillaConsumoMMPP/ObtenerTipoOrdenFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<List<DTO_TiposOrden>> ObtenerTipoOrdenFabricacion()
        {
            try
            {
                return await _IDAO_PlantillaConsumosMMPP.ObtenerTipoOrdenFabricacion();

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ObtenerPlantillasConsumosMMPP", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/plantillaConsumoMMPP/ObtenerTiposDisparador")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<List<TipoDisparador_DTO>> ObtenerTiposDisparador()
        {
            try
            {
                return await _IDAO_PlantillaConsumosMMPP.ObtenerTipoDisparador();

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ObtenerTiposDisparador", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/plantillaConsumoMMPP/ObtenerModoDescuento")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<List<ModoDescuentoConsumoMMPP_DTO>> ObtenerModoDescuento()
        {
            try
            {
                return await _IDAO_PlantillaConsumosMMPP.ObtenerModoDescuento();

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ObtenerTiposDisparador", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }


        [Route("api/plantillaConsumoMMPP/Create")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<PlantillaConsumoMMPP_DTO> Create([FromBody] PlantillaConsumoMMPP_DTO plantilla)
        {
            try
            {
                return await _IDAO_PlantillaConsumosMMPP.Create(plantilla);

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ObtenerTiposDisparador", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/plantillaConsumoMMPP/Update")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<PlantillaConsumoMMPP_DTO> Update([FromBody] PlantillaConsumoMMPP_DTO plantilla)
        {
            try
            {
                PlantillaConsumoMMPP_DTO _result = new PlantillaConsumoMMPP_DTO();
                if (plantilla != null){
                    if(plantilla.IdPlantillaConsumo != 0)
                        _result = await _IDAO_PlantillaConsumosMMPP.Update(plantilla);
                }

                return _result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ObtenerTiposDisparador", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/plantillaConsumoMMPP/Delete")]
        [HttpDelete]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<int> Delete([FromBody] PlantillaConsumoMMPP_DTO plantilla)
        {
            try
            {
                int _result = 0;
                if (plantilla != null)
                {
                    if (plantilla.IdPlantillaConsumo != 0)
                        _result = await _IDAO_PlantillaConsumosMMPP.Delete(plantilla.IdPlantillaConsumo);
                }

                return _result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ObtenerTiposDisparador", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/ubicacionesPlantillaConsumo/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP,Funciones.FAB_PROD_RES_4_VisualizacionConsumosMMPP)]
        public async Task<List<UbicacionesPlantillaConsumoDto>> ubicacionesPlantillaConsumo(int id)
        {
            try
            {
                List<UbicacionesPlantillaConsumoDto> _result = new List<UbicacionesPlantillaConsumoDto>();
                if(id != 0)
                {
                    _result = await _IDAO_PlantillaConsumosMMPP.ObtenerUbicacionesPlantilla(id);
                }

                return _result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.UbicacionesPlantilla", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/tipoSemielaboradosPlantillaConsumo/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP, Funciones.FAB_PROD_RES_4_VisualizacionConsumosMMPP)]
        public async Task<List<TipoSemielaboradoPlantillaConsumoDto>> tipoSemielaboradosPlantillaConsumo(int id)
        {
            try
            {
                List<TipoSemielaboradoPlantillaConsumoDto> _result = new List<TipoSemielaboradoPlantillaConsumoDto>();
                if (id != -1)
                {
                    _result = await _IDAO_PlantillaConsumosMMPP.ObtenerTiposSemielaboradosPlantilla(id);
                }

                return _result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.UbicacionesPlantilla", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/tipoSemielaboradosPlantillaConsumo")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<TipoSemielaboradoPlantillaConsumoDto> ActualizarTipoSemielaboradosPlantillaConsumo(TipoSemielaboradoPlantillaConsumoDto tipo)
        {
            try
            {
                TipoSemielaboradoPlantillaConsumoDto _result = new TipoSemielaboradoPlantillaConsumoDto();
                if (tipo != null)
                {
                    _result = await _IDAO_PlantillaConsumosMMPP.ActualizarCantidadTiposSemielaboradosPlantilla(tipo);
                }

                return _result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ActualizarTipoSemielaboradosPlantillaConsumo", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        

        [Route("api/ActualizarPlantillaUbicaciones")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<bool> ActualizarPlantillaUbicaciones(PlantillaUbicacionesDto plantillaUbicacion)
        {
            PlantillaUbicacionesDto _result = new PlantillaUbicacionesDto();
            try
            {
                _result = await _IDAO_PlantillaConsumosMMPP.ActualizarPlantillaUbicaciones(plantillaUbicacion);
                return _result != null ? true : false;
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return false;

        }

        [Route("api/ActualizarPlantillaTipoSemielaborado")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<bool> ActualizarPlantillaTipoSemielaborado(PlantillaTiposSemielaboradosDto plantillaTipo)
        {
            PlantillaTiposSemielaboradosDto _result = new PlantillaTiposSemielaboradosDto();
            try
            {
                _result = await _IDAO_PlantillaConsumosMMPP.ActualizarPlantillaTiposSemielaborados(plantillaTipo);
                return _result != null ? true : false;
            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return false;

        }

        [Route("api/disparadorPlantillasKOP/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP, Funciones.FAB_PROD_RES_4_VisualizacionConsumosMMPP)]
        public async Task<List<DisparadorKOPDto>> disparadorPlantillasKOP(int id)
        {
            try
            {
                List<DisparadorKOPDto> _result = new List<DisparadorKOPDto>();
                if (id != -1)
                {
                    _result = await _IDAO_PlantillaConsumosMMPP.ObtenerDisparadorKOPPlantilla(id);
                }

                return _result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.disparadorPlantillasKOP", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/ActualizarPlantillaDisparadorKOP")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<bool> ActualizarPlantillaDisparadorKOP(PlantillaDisparadoresKOPDto plantillaDisparador)
        {
            PlantillaDisparadoresKOPDto _result = new PlantillaDisparadoresKOPDto();
            try
            {
                _result = await _IDAO_PlantillaConsumosMMPP.ActualizarPlantillaDisparadorKOP(plantillaDisparador);
                return _result != null ? true : false;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ActualizarPlantillaDisparadorKOP", "WEB-FABRICACION", "Sistema");

            }

            return false;

        }

        [Route("api/disparadorPlantillasTransferencia/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP, Funciones.FAB_PROD_RES_4_VisualizacionConsumosMMPP)]
        public async Task<List<DisparadorTransferenciaDto>> disparadorPlantillasTransferencia(int id)
        {
            try
            {
                List<DisparadorTransferenciaDto> _result = new List<DisparadorTransferenciaDto>();
                if (id != -1)
                {
                    _result = await _IDAO_PlantillaConsumosMMPP.ObtenerDisparadorTransferenciaPlantilla(id);
                }

                return _result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.disparadorPlantillasKOP", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/plantillaConsumoMMPP/ObtenerPrefijosLoteSAI")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<List<PrefijosLoteSAIDto>> ObtenerPrefijosLoteSAI()
        {
            try
            {
                return await _IDAO_PlantillaConsumosMMPP.ObtenerPrefijosLoteSAI();

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ObtenerPrefijosLoteSAI", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/plantillaConsumoMMPP/ObtenerMaterialSAI")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<List<MaterialSAIDto>> ObtenerMaterialSAI()
        {
            try
            {
                return await _IDAO_PlantillaConsumosMMPP.ObtenerMaterialSAI();

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ObtenerMaterialSAI", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/disparadorPlantillasTransferencia/Create", Name ="CreateDisparadorTransferencia")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<DisparadorTransferenciaDto> CreateDisparadorTransferencia([FromBody] DisparadorTransferenciaDto plantilla)
        {
            try
            {
                return await _IDAO_PlantillaConsumosMMPP.CreateDisparadorTransferencia(plantilla);

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.CreateDisparadorTransferencia", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/disparadorPlantillasTransferencia/Update", Name = "UpdateDisparadorTransferencia")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<DisparadorTransferenciaDto> UpdateDisparadorTransferencia([FromBody] DisparadorTransferenciaDto plantilla)
        {
            try
            {
                return await _IDAO_PlantillaConsumosMMPP.UpdateDisparadorTransferencia(plantilla);

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.UpdateDisparadorTransferencia", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/disparadorPlantillasTransferencia/Delete", Name = "DeleteDisparadorTransferencia")]
        [HttpDelete]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<int> DeleteDisparadorTransferencia([FromBody] DisparadorTransferenciaDto plantilla)
        {
            try
            {
                return await _IDAO_PlantillaConsumosMMPP.DeleteDisparadorTransferencia(plantilla.IdDisparadorTransferencia);

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.DeleteDisparadorTransferencia", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/plantillaConsumoMMPP/ObtenerLotesAsociados/{idPlantilla}/{idUbicacion}/{idMaterial}")]
        [HttpGet]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<List<LoteAsociadoDto>> ObtenerLotesAsociados(int idPlantilla,int idUbicacion, string idMaterial)
        {
            try
            {
                List<LoteAsociadoDto> _result = new List<LoteAsociadoDto>();
                _result = await _IDAO_PlantillaConsumosMMPP.ObtenerLotesAsociados(idPlantilla, idUbicacion, idMaterial);
                if(_result.Count() > 0)
                {
                     _result.ToList().ForEach(c => c.HabilitarSeleccion = true);
                }
                return _result;

            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ObtenerLotesAsociados", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        [Route("api/plantillaConsumoMMPP/ActualizarPlantillaLotesAsociados")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_RES_4_GestionConsumosMMPP)]
        public async Task<bool> ActualizarPlantillaLotesAsociados(PlantillaLotesAsociadosDto plantillaDisparador)
        {
            PlantillaLotesAsociadosDto _result = new PlantillaLotesAsociadosDto();
            try
            {
                _result = await _IDAO_PlantillaConsumosMMPP.ActualizarPlantillaLotesAsociados(plantillaDisparador);
                return _result != null ? true : false;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "PlantillaConsumoMMPPController.ActualizarPlantillaLotesAsociados", "WEB-FABRICACION", "Sistema");

            }

            return false;

        }

        [Route("api/ObtenerPlantillasPorId")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_VisualizacionMovimientoLotesFabricacion, Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion)]
        public async Task<PlantillaConsumoMMPP_DTO> ObtenerPlantillasPorId([FromUri] int? id)
        {
            if (id.HasValue)
                return await _IDAO_PlantillaConsumosMMPP.ObtenerPlantillasConsumosMMPPPorId(id.Value);

            return new PlantillaConsumoMMPP_DTO();
        }



    }
}