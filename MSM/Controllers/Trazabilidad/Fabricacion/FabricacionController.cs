using Common.Models.Trazabilidad;
using Common.Models.Trazabilidad.Estado;
using Common.Models.Trazabilidad.Fabricacion;
using Common.Models.Trazabilidad.Genealogia;
using MSM.BBDD.Trazabilidad.Fabricacion;
using MSM.BBDD.Trazabilidad.Genealogia;
using MSM.Mappers.DTO.Fabricacion.Api;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json.Linq;
using MSM.BBDD.Planta;

namespace MSM.Controllers.Trazabilidad.FabricacionController
{
    [Authorize]
    public class FabricacionController : ApiController
    {
        private readonly IDAO_MovimientosLotes _IDAO_MovimientosLotes;
        private readonly IDAO_Genealogia _IDAO_Genealogia;

        public FabricacionController(IDAO_MovimientosLotes IDAO_MovimientosLotes, IDAO_Genealogia IDAO_Genealogia)
        {
            _IDAO_MovimientosLotes = IDAO_MovimientosLotes;
            _IDAO_Genealogia = IDAO_Genealogia;
        }

        [Route("api/ObtenerMovimientosLotesFabricacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_VisualizacionMovimientoLotesFabricacion, Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion)]
        public async Task<dynamic> ObtenerMovimientosLotesFabricacion(dynamic fechas)
        {
            return await _IDAO_MovimientosLotes.ObtenerMovimientosLotes(fechas);
        }

        [Route("api/AgregarMovimientosLotesFabricacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion)]
        public async Task<MovimientoLoteDto> AgregarMovimientosLotesFabricacion(MovimientoLoteDto movimientoDto)
        {
            movimientoDto.CreadoPor = HttpContext.Current.User.Identity.Name;
            return await _IDAO_MovimientosLotes.AgregarMovimientosLotes(movimientoDto);
        }

        [Route("api/EditarMovimientosLotesFabricacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion)]
        public async Task<MovimientoLoteDto> EditarMovimientosLotesFabricacion(MovimientoLoteDto movimientoDto)
        {
            movimientoDto.CreadoPor = HttpContext.Current.User.Identity.Name;
            return await _IDAO_MovimientosLotes.EditarMovimientosLotes(movimientoDto);
        }

        [Route("api/AgregarMovimientoLoteFabricacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion)]
        public async Task<MovimientoLoteDto> AgregarMovimientoLoteFabricacion(MovimientoLoteDto movimientoDto)
        {
            movimientoDto.Creado = movimientoDto.Creado?.ToUniversalTime();
            movimientoDto.CreadoPor = HttpContext.Current.User.Identity.Name;
            return await _IDAO_MovimientosLotes.AgregarMovimientoLoteFabricacion(movimientoDto);
        }

        [Route("api/AgregarLoteMMPPFabricacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.TRA_TRM_GES_1_GestionCrearLoteMMPP)]
        public async Task<DTO_LoteMMPPFabricacion> AgregarLoteMMPPFabricacion(DTO_LoteMMPPFabricacion entity)
        {
            entity.FechaEntradaPlanta = entity.FechaEntradaPlanta.Value.ToUniversalTime();
            entity.FechaEntradaUbicacion = entity.FechaEntradaUbicacion.Value.ToUniversalTime();

            if(entity.FechaCaducidad != null)
                entity.FechaCaducidad =  entity.FechaCaducidad.Value.ToUniversalTime();

            return await _IDAO_MovimientosLotes.AgregarLoteMMPPFabricacion(entity);
        }

        [Route("api/AgregarLoteSemielaboradoTM")]
        [HttpPost]
        [ApiAuthorize(Funciones.TRA_TRM_GES_1_GestionCrearLoteMMPP)]
        public async Task<DTO_LoteSemielaborado> AgregarLoteSemielaboradoTM(DTO_LoteSemielaborado entity)
        {
            entity.FechaCreacion = DateTime.Now.ToUniversalTime();
            return await _IDAO_MovimientosLotes.AgregarLoteSemielaborado(entity);
        }

        [Route("api/ObtenerMaestroTipoLoteManualSemielaborados/{idTipoMaterial}")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_TRM_GES_1_GestionCrearLoteMMPP)]
        public async Task<List<MaestroTipoLoteManualSemielaboradosDto>> ObtenerMaestroTipoLoteManualSemielaborados(string idTipoMaterial)
        {
            try
            {
                return await _IDAO_MovimientosLotes.ObtenerMaestroTipoLoteManualSemielaborados(idTipoMaterial);
            }
            catch (Exception)
            {
                return new List<MaestroTipoLoteManualSemielaboradosDto>();
            }
        }

        [Route("api/ObtenerTransferenciasFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_VisualizacionMovimientoLotesFabricacion, Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion)]
        public async Task<List<TransferenciaLoteFabricacionDto>> ObtenerTransferenciasFabricacion([FromUri] int? id)
        {
            if (id.HasValue)
                return await _IDAO_MovimientosLotes.ObtenerTransferenciasLotes(id.Value);

            return new List<TransferenciaLoteFabricacionDto>();
        }

        [Route("api/AgregarTransferenciaFabricacion")]
        [HttpPost]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion)]
        public async Task<TransferenciaLoteFabricacionDto> AgregarTransferenciaFabricacion([FromBody] TransferenciaLoteFabricacionDto transferencia)
        {
            if (transferencia != null)
                return await _IDAO_MovimientosLotes.AgregarTransferenciaLotes(transferencia);

            return new TransferenciaLoteFabricacionDto();
        }
        
        [Route("api/AgregarTransferenciaTCP")]
        [HttpPost]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion)]
        public async Task<List<TransferenciaTCPDto>> AgregarTransferenciaTCP([FromBody] TransferenciaTCPDto transferencia)
        {
            if (transferencia != null)
                return await _IDAO_MovimientosLotes.AgregarTransferenciaTCP(transferencia);

            return new List<TransferenciaTCPDto>();
        }

        [Route("api/ObtenerLoteMMPPFabricacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_VisualizacionMovimientoLotesFabricacion, Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion,
                      Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
        public async Task<DTO_LoteMMPPFabricacion> ObtenerLoteMMPPFabricacion([FromUri] int? id)
        {
            if (id.HasValue)
                return await _IDAO_MovimientosLotes.ObtenerLoteMMPPFabricacion(id.Value);

            return new DTO_LoteMMPPFabricacion();
        }

        [Route("api/ActualizarLoteRevision")]
        [HttpPut]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion, Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
        public async Task<string> ActualizarLoteRevision([FromUri] string tipo, [FromBody] JObject datosActualizar)
        {
            // Recoge el resumen de cambios enviado por el frontend
            string resumenCambios = datosActualizar["resumenCambios"]?.ToString() ?? "";
            string loteOriginal = datosActualizar["LoteOriginal"]?.ToString() ?? "";

            string resultado = "";
            string lote = "";

            if (string.Equals(tipo, "FAB", StringComparison.OrdinalIgnoreCase))
            {
                var dto = datosActualizar.ToObject<DTO_LoteMMPPFabricacion>();
                resultado = await _IDAO_MovimientosLotes.ActualizarLoteMMPPFabricacion(dto);
                lote = dto.IdLoteMES != null ? dto.IdLoteMES.ToString() : "";
            }
            else if (string.Equals(tipo, "SEMI", StringComparison.OrdinalIgnoreCase))
            {
                if (datosActualizar["IdUbicacion"] != null)
                {
                    datosActualizar["IdUbicacionOrigen"] = datosActualizar["IdUbicacion"];
                    datosActualizar.Remove("IdUbicacion");
                }
                var dto = datosActualizar.ToObject<DTO_LoteSemielaborado>();
                resultado = await _IDAO_MovimientosLotes.ActualizarLoteSemielaborado(dto);
                lote = dto.LoteMES != null ? dto.LoteMES.ToString() : "";
            }
            else
            {
                throw new ArgumentException("Tipo de lote no reconocido. Debe ser 'FAB' o 'SEMI'.");
            }

            // Si la actualización fue correcta, registra el log con los cambios y usuario
            if (resultado == "")
            {
                string mensajeLog = $"Se ha modificado el lote {loteOriginal}. Cambios: {resumenCambios}";
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "FabricacionController.ActualizarLoteRevision", mensajeLog, HttpContext.Current.User.Identity.Name);
            }

            return resultado;
        }

        [Route("api/ObtenerLoteSemielaborado")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_VisualizacionMovimientoLotesFabricacion, Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion,
            Funciones.FAB_PROD_EXE_20_GestionRevisionLotesMMPPCoccion)]
        public async Task<DTO_LoteSemielaborado> ObtenerLoteSemielaborado([FromUri] int? id)
        {
            if (id.HasValue)
                return await _IDAO_MovimientosLotes.ObtenerLoteSemielaborado(id.Value);

            return new DTO_LoteSemielaborado();
        }

        [Route("api/trazabilidadDescendente")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_VisualizacionTrazabilidadDescendente, Funciones.TRA_PROD_FAB_1_GestionTrazabilidadDescendente)]
        public async Task<List<LoteDto>> ObtenerTrazabilidadDescendente([FromBody] FilterDto filters)
        {
            var _result = await _IDAO_Genealogia.ObtenerTrazabilidadDescendente(filters);
            return _result;
        }

        [Route("api/trazabilidadAscendente")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_2_VisualizacionTrazabilidadAscendente, Funciones.TRA_PROD_FAB_2_GestionTrazabilidadAscendente)]
        public async Task<List<LoteDto>> ObtenerTrazabilidadAscendente([FromBody] FilterDto filters)
        {
            var _result = await _IDAO_Genealogia.ObtenerTrazabilidadAscendente(filters);
            return _result;
        }


        [Route("api/movimientosHaciaLotes")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_2_VisualizacionTrazabilidadAscendente, Funciones.TRA_PROD_FAB_2_GestionTrazabilidadAscendente)]
        public async Task<dynamic> ObtenerMovimientosHaciaLotes([FromBody] List<int> idLotesDestino)
        {
            var _result = await _IDAO_Genealogia.ObtenerMovimientosHaciaLotes(idLotesDestino);
            return _result;
        }

        [Route("api/movimientosHaciaLotesTotales")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_2_VisualizacionTrazabilidadAscendente, Funciones.TRA_PROD_FAB_2_GestionTrazabilidadAscendente)]
        public async Task<dynamic> ObtenerMovimientosHaciaLotesTotales([FromBody] List<int> idLotesDestino)
        {
            var _result = await _IDAO_Genealogia.ObtenerMovimientosHaciaLotesTotales(idLotesDestino);
            return _result;
        }

        [Route("api/trazabilidadCruzada")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_3_VisualizacionTrazabilidadCruzada, Funciones.TRA_PROD_FAB_3_GestionTrazabilidadCruzada)]
        public async Task<List<LoteDto>> ObtenerTrazabilidadCruzada([FromBody] FilterDto filters)
        {
            var _result = await _IDAO_Genealogia.ObtenerTrazabilidadCruzada(filters);
            return _result;
        }

        [Route("api/EliminarMovimientoLote/{idMovimiento}")]
        [HttpDelete]
        [ApiAuthorize(Funciones.TRA_PROD_FAB_1_GestionMovimientoLotesFabricacion)]
        public async Task<int> EliminarMovimientoLote([FromUri] int idMovimiento)
        {
            var _result = await _IDAO_Genealogia.EliminarMovimiento(idMovimiento);

            return _result;
        }

        [Route("api/ActualizarCantidadMovimientos")]
        [HttpPost]
        [ApiAuthorize(Funciones.FAB_PROD_EXE_9_GestionWoActivas, Funciones.FAB_PROD_EXE_19_GestionRevisionMMPPCoccion)]
        public async Task<bool> ActualizarCantidadMovimientos([FromBody] MovimientoLoteCantidadDto movimientoCantidad)
        {
            try
            {
                var resultado = await _IDAO_MovimientosLotes.ActualizarCantidadMovimientos(movimientoCantidad);

                if (resultado)
                {
                    string idsMovimientos = movimientoCantidad.IdMovimientos != null
                        ? string.Join(", ", movimientoCantidad.IdMovimientos)
                        : "";
                    string cantidad = movimientoCantidad.Cantidad.HasValue
                        ? movimientoCantidad.Cantidad.Value.ToString("N2")
                        : "";
                    string mensajeLog = $"Se han modificado Movimientos: {idsMovimientos} -> CantidadMovimiento: {cantidad}";

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "FabricacionController.ActualizarCantidadMovimientos", mensajeLog, HttpContext.Current.User.Identity.Name);
                }

                return resultado;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }





}