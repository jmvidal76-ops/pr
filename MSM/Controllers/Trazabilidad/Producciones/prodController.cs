//using ApplicationCore.DTOs;
using Common.Models.Operation;
using MSM.BBDD.Trazabilidad.Producciones;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;
using System.Web.Http;

namespace MSM.Controllers.Trazabilidad
{
    [Authorize]
    public class prodController : ApiController
    {

        private readonly IDAO_Producciones _iDAO_Producciones;

        public prodController(IDAO_Producciones iDAO_Producciones)
        {
            _iDAO_Producciones = iDAO_Producciones;
        }

        [Route("api/Produccion")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_VisualizacionPaletsProducidos, Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<List<dynamic>> ObtenerProducciones()
        {

            List<dynamic> lista = new List<dynamic>();
            List<dynamic> result = await _iDAO_Producciones.Get();
            if (result != null)
            {
                if (result.Count > 0)
                {
                    lista = result;
                }
            }
            return lista;

        }

        [Route("api/Produccion/{fechaInicio}/{fechaFin}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_VisualizacionPaletsProducidos, Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<List<dynamic>> ObtenerProducciones(string fechaInicio, string fechaFin)
        {
            DateTime fInicio = DateTime.ParseExact(fechaInicio, "yyyyMMddHHmmss", CultureInfo.InvariantCulture);
            DateTime fFin = DateTime.ParseExact(fechaFin, "yyyyMMddHHmmss", CultureInfo.InvariantCulture);

            List<dynamic> lista = new List<dynamic>();

            List<dynamic> result = await _iDAO_Producciones.GetByDates(fInicio.ToString("yyyy-MM-ddTHH:mm:ss"), fFin.ToString("yyyy-MM-ddTHH:mm:ss"));
            if (result != null)
            {
                if (result.Count > 0)
                {
                    lista = result;
                }
            }

            return lista;
        }

        [Route("api/ProduccionInfo/{idOrden}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_VisualizacionPaletsProducidos, Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<List<dynamic>> ObtenerProducciones(string idOrden)
        {

            List<dynamic> lista = new List<dynamic>();
            List<dynamic> result = await _iDAO_Producciones.GetByOrder(idOrden);
            if (result != null)
            {
                if (result.Count > 0)
                {
                    lista = result;
                }
            }
            return lista;

        }

        [Route("api/ConsumDelete")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_VisualizacionPaletsProducidos, Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<dynamic> ConsumDelete([FromBody] ConsumDto consum)
        {

            return await _iDAO_Producciones.DeleteConsum(consum);

        }

        [Route("api/material/bom/{idProducto}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_VisualizacionPaletsProducidos, Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<dynamic> GetBomInfoMaterialByProduct(string idProducto)
        {

            return await _iDAO_Producciones.GetBomMaterialByProduct(idProducto);

        }

        [Route("api/ubicacion/UbicacionesLinea/{numLinea}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_VisualizacionPaletsProducidos, Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<dynamic> GetUbicacionesbyIdLinea(string numLinea)
        {

            return await _iDAO_Producciones.GetUbicacionesByIdLinea(numLinea);

        }

        [Route("api/ubicacion/Lote/{refMaterial}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_VisualizacionPaletsProducidos, Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<dynamic> GetUbicacionesLotebyRef(string refMaterial)
        {
            return await _iDAO_Producciones.GetUbicacionLoteByRefMaterial(refMaterial);

        }

        [Route("api/Consum", Name = "AddConsum")]
        [HttpPut]
        public async Task<string> AddConsum([FromBody] ConsumDto consum)
        {

            var res = await _iDAO_Producciones.AddConsum(consum);

            return res;
        }

        [Route("api/ConsumUPD", Name = "UpdateConsum")]
        [HttpPut]
        public async Task<string> UpdateConsum([FromBody] ConsumDto consum)
        {

            var res = await _iDAO_Producciones.UpdateConsum(consum);

            return res;
        }

        [Route("api/PartitionByIDLinea/{linea}/{refMaterial}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_VisualizacionPaletsProducidos, Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<List<dynamic>> GetPartitionByIdLineaData(string linea, string refMaterial)
        {
            return await _iDAO_Producciones.GetPartitionsByIDAndLinea(linea, refMaterial);

        }

        [Route("api/ProduccionOffset/{idProduccion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_VisualizacionPaletsProducidos, Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<List<dynamic>> GetProducctionOffsetbyID(string idProduccion)
        {
            return await _iDAO_Producciones.GetProductionsOffsetById(idProduccion);

        }

        [Route("api/Consumo/Produccion/{idProduccion}/{ubicacion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_VisualizacionPaletsProducidos, Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<List<dynamic>> GetProduccionCosumByIdAndLocation(string idProduccion, string ubicacion)
        {
            return await _iDAO_Producciones.GetProduccionCosumByIdAndLocation(idProduccion, ubicacion);

        }

        [Route("api/UpdProduccionOffset")]
        [HttpPut]
        public async Task<string> UpdateOffset([FromBody] ProductionOffSetsDto consum)
        {

            var res = await _iDAO_Producciones.UpdateOffset(consum);

            return res;
        }

        [Route("api/UpdProduccionQuarantine")]
        [HttpPut]
        public async Task<int?> Put([FromBody] UpdProduccionDto updProduction)
        {

            var result = await _iDAO_Producciones.UpdateQuarantine(updProduction);
            return Ok(result);
        }

        [Route("api/UpdProduccionBlocking")]
        [HttpPut]
        public async Task<dynamic> UpdProduccionBlocking(UpdProduccionDto upd)
        {
            var result = await _iDAO_Producciones.UpdProduccionBlocking(upd);
            return Ok(result);
        }

        [Route("api/UpdProduccionLabel")]
        [HttpPut]
        public async Task<dynamic> UpdProducctionLabel(UpdProduccionDto upd)
        {
            var result = await _iDAO_Producciones.UpdProducctionLabel(upd);
            return Ok(result);
        }

        [Route("api/UpdProductionPartition")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<IHttpActionResult> UpdProductionPartition(ProduccionesDto produccionesDto)
        {
            var result = await _iDAO_Producciones.UpdProductionPartition(produccionesDto);
            return Json(result);
        }

        [Route("api/anularHabilitarEtiquetas")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<IHttpActionResult> AnularEtiquetas(ProduccionesDto produccionesDto)
        {
            var result = await _iDAO_Producciones.AnularHabilitarEtiquetas(produccionesDto);
            return Json(result);
        }

        [Route("api/modificarFechaProduccion")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_DAT_6_GestionPaletsProducidos)]
        public async Task<IHttpActionResult> ModificarFechaProduccion(ProduccionesDto produccionesDto)
        {
            var result = await _iDAO_Producciones.ModificarFechaProduccion(produccionesDto);
            return Json(result);
        }

        [Route("api/guardarSSCCMuestraTomada")]
        [HttpPost]
        [ApiAuthorize(Funciones.CEL_16_GestionSSCCPaletMuestra)]
        public async Task<IHttpActionResult> GuardarSSCCMuestraTomada(PaletsProductoAcabadoMuestrasDto dto)
        {
            var result = await _iDAO_Producciones.GuardarSSCCMuestraTomada(dto);
            return Json(result);
        }
    }
}