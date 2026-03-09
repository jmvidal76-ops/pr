using Common.Models;
using Common.Models.Operation;
using Common.Models.Transportes;
using MSM.BBDD.Fabricacion;
using MSM.BBDD.Planta;
using MSM.BBDD.Trazabilidad;
using MSM.BBDD.Trazabilidad.Operations;
using MSM.BBDD.Trazabilidad.Transporte;
using MSM.Controllers.Planta;
using MSM.Models.Trazabilidad;
using MSM.Security;
using Siemens.SimaticIT.MM.Breads.Types;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen.Operacion
{
    public enum TipoOrigenEnum
    {
        ClienteTipoOperacion
    }

    [Authorize]
    public class OperacionController : ApiController
    {
        private readonly IDAO_Operations _iDAO_Operacion;
        private readonly IDAO_Ubicacion _iDAO_Ubicacion;

        public OperacionController(IDAO_Operations iDAO_Operacion, IDAO_Ubicacion iDAO_Ubicacion)
        {
            _iDAO_Operacion = iDAO_Operacion;
            _iDAO_Ubicacion = iDAO_Ubicacion;
        }




        /// <summary>
        /// Metodo que obtiene la data para los combos de autocomplete según el tipo
        /// </summary>
        /// <returns>List DataAutoComplete</returns>
        [Route("api/GetDataAutoCompleteTipoOperacion")]
        [HttpGet]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_GestionOperaciones)]
        public async Task<List<DataAutoComplete>> GetDataAutoCompleteTipoOperacion()
        {
            List<DataAutoComplete> listOperador = new List<DataAutoComplete>();
            try
            {
                DataAutoComplete dataAutoComplete = new DataAutoComplete();
                List<TipoOperacionDto> tipoOperacion = await _iDAO_Operacion.GetTypeOperation();
                foreach (var item in tipoOperacion)
                {
                    dataAutoComplete = new DataAutoComplete();
                    dataAutoComplete.ID = item.IdTipoOperacion;
                    dataAutoComplete.Nombre = item.Descripcion;
                    listOperador.Add(dataAutoComplete);
                }


            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }
            return listOperador;
        }

        /// <summary>
        /// Metodo que obtiene la lista de los Estados de los lotes
        /// </summary>
        /// <returns></returns>
        [Route("api/GetLotStatus")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
        public async Task<List<LotStatusDto>> GetLotStatus()
        {
            List<LotStatusDto> listStatus = new List<LotStatusDto>();
            List<LotStatusDto> status = await _iDAO_Operacion.GetStatusAll();
            if (status != null)
            {
                if (status.Count > 0)
                {
                    listStatus = status;
                }
            }
            return listStatus;
        }





        /// <summary>
        /// Metodo que obtiene las recepciones segun el ID de Material
        /// </summary>
        /// <returns></returns>
        [Route("api/GetOperationsByFilters")]
        [HttpPut]
        [ApiAuthorize(Funciones.TRA_PROD_DAT_1_GestionOperaciones)]
        public async Task<List<OperationDto>> GetOperationsByFilters(OperationDto operacion)
        {
            List<OperationDto> opera = new List<OperationDto>();
            CultureInfo _culture = new CultureInfo("fr-CA");
            string filters = "";
            try
            {
                if (operacion.FechaInicio != null)
                    operacion.FechaInicio = DateTime.ParseExact(operacion.FechaInicio.Value.ToLocalTime().ToString("yyyy-MM-dd"), "yyyy-MM-dd", _culture);
                if (operacion.FechaFin != null)
                    operacion.FechaFin = DateTime.ParseExact(operacion.FechaFin.Value.ToLocalTime().ToString("yyyy-MM-dd"), "yyyy-MM-dd", _culture);
                var result = await _iDAO_Operacion.GetOperationsByFilters(operacion);
                return result != null ? result : opera;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OperacionController.GetOperationsByFilters", "WEB-TRAZABILIDAD", "Sistema");
                //DAO_Log.registrarLog(DateTime.Now, "OperacionController.GetOperationsByFilters", ex, HttpContext.Current.User.Identity.Name);
                // throw new Exception(IdiomaController.GetResourceName("ERROR_BUSCANDO_LOS"));
            }
            return opera;
        }

        /// <summary>
        /// Método que obtiene la operación a traves de su Id
        /// </summary>
        /// <param name="id">Id de la Operacion</param>
        /// <returns></returns>
        [Route("api/GetOperationsByIdOperation")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_5_GestionLotesSinCodigoJDE)]
        public async Task<OperationDto> GetOperationsByIdOperation(long id)
        {
            try
            {
                return await _iDAO_Operacion.GetOperationsByIdOperation(id);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "OperacionController.GetOperationsByIdOperation", "WEB-TRAZABILIDAD", "Sistema");
                return new OperationDto();
            }

        }

        /// <summary>
        /// actualiza un lote
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [Route("api/UpdateOperations")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_5_GestionLotesSinCodigoJDE)]
        public async Task<bool> UpdateOperations(OperationDto dto)
        {
            return await _iDAO_Operacion.UpdateOperations(dto);
        }

       

        /// <summary>
        /// Elimina lotes
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [Route("api/DeleteLotes")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_5_GestionLotesSinCodigoJDE)]
        public async Task<bool> DeleteLotes([FromBody] int idLote)
        {
            await _iDAO_Operacion.DeleteOperations(idLote);
            return true;
        }
    }
}