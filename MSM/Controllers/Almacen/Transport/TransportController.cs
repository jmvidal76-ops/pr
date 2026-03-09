using Common.Models.LoteUbicacion;
using Common.Models.Operation;
using Common.Models.RTDS;
using Common.Models.Transportes;
using MSM.BBDD.Almacen.ColasCamiones;
using MSM.BBDD.Planta;
using MSM.BBDD.RTDS;
using MSM.BBDD.Trazabilidad.Operations;
using MSM.BBDD.Trazabilidad.Transporte;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen.Transporte
{


    [Authorize]
    public class TransportController : ApiController
    {
        Microsoft.AspNet.SignalR.IHubContext hub = Microsoft.AspNet.SignalR.GlobalHost.ConnectionManager.GetHubContext<MSMHub>();
        #region ATRIBUTES
            private readonly IDAO_Transporte _iDAO_Transporte;
            private readonly ISitRTDS _sitRTDS;
            private readonly IDAO_ColasCamiones _iDAO_ColasCamiones;
            private readonly IDAO_Operations _iDAO_Operations;
        #endregion

        #region CONSTRUCTOR
        public TransportController(IDAO_Transporte DAOTransporte, ISitRTDS sitRTDS, IDAO_ColasCamiones iDAO_ColasCamiones, IDAO_Operations iDAO_Operations)
        {
            _iDAO_Transporte = DAOTransporte;
            _sitRTDS = sitRTDS;
            _iDAO_ColasCamiones = iDAO_ColasCamiones;
            _iDAO_Operations = iDAO_Operations;
        }
        #endregion

        #region TRANSPORT

        /// <summary>
        /// Metodo que obtiene todos los transportes 
        /// </summary>
        /// <returns>List of transport</returns>
        [Route("api/GetTransports")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
        public async Task<List<TransporteDto>> GetTransports()
        {
            List<TransporteDto> transportes = await _iDAO_Transporte.GetTransports();

            return transportes;
        }


        //[Route("api/GetTransportesPendientes")]
        //[HttpGet]
        //[ApiAuthorize(Funciones.ALM_PROD_DAT_6_CamionesPendientes, Funciones.ALM_PROD_DAT_6_GestiónCamionesPendientes)]
        //public async Task<List<TransporteDto>> GetTransportesPendientes()
        //{

        //    List<TransporteDto> listTransporte = new List<TransporteDto>();
        //    List<TransporteDto> transportes = await _iDAO_Transporte.GetTransportesPendientes();

        //    if (transportes.Count > 0)
        //    {
        //        listTransporte = transportes;
        //    }
        //    return listTransporte;
        //}

        [Route("api/GetHistoricoTransportes")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_4_HistoricoCamiones, Funciones.ALM_PROD_DAT_4_GestionHistoricoCamiones)]
        public async Task<IHttpActionResult> GetHistoricoTransportes(DateTime? fechaInicio = null, DateTime? fechaFin = null)
        {
            if (fechaInicio == null || fechaFin == null)
            {
                return StatusCode(System.Net.HttpStatusCode.MethodNotAllowed);
            }

            DateTime inicio = fechaInicio.Value.Date.ToUniversalTime();
            DateTime fin = fechaFin.Value.AddDays(1).Date.ToUniversalTime();

            if (inicio >= fin)
            {
                return StatusCode(System.Net.HttpStatusCode.NotAcceptable);
            }

            return Json(await _iDAO_Transporte.GetHistoricoTransportes(inicio, fin));

        }

        /// <summary>
        /// Metodo que obtiene el último transporte de una matricula y tipo de operacion concreto, para poder autorellenar el formulario con sus datos
        /// </summary>
        /// <returns>ultimo transporte si existe</returns>
        [Route("api/GetUltimoTransporte")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito, Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
        public async Task<TransporteDto> GetUltimoTransporte(int idMatricula, int tipoOperacion)
        {
            TransporteDto transporte = await _iDAO_Transporte.GetUltimoTransporte(idMatricula, tipoOperacion);

            return transporte;
        }


        [Route("api/FinalizarTransporte")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
        public async Task<bool> FinalizarTransporte(TransporteDto transporte)
        {
            transporte.ActualizadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
            var result = await _iDAO_Transporte.FinalizarTransporte(transporte);

            return result;
        }


        /// <summary>
        /// Metodo que agrega un nuevo transporte
        /// </summary>
        /// <param name="transporte">Objeto de tipo TransporteDto</param>
        /// <returns>True or False</returns>
        [Route("api/AddTransport")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
        public async Task<bool> AddTransport(TransporteDto transporte)
        {
            bool returnValue = false;
            transporte.CreadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
            var operacion = await _iDAO_Transporte.Post(transporte);
            returnValue = operacion != null ? true : false;

            hub.Clients.All.eventFinalizarDescargaTerminal();
            hub.Clients.All.eventFinalizarDescargaPortal();

            return returnValue;
        }


        /// <summary>
        /// Metodo que actualiza un transporte
        /// </summary>
        /// <param name="transporte">Objeto de tipo TransporteDto </param>
        /// <returns>True or False</returns>
        [Route("api/UpdateTransport")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito, Funciones.ALM_PROD_DAT_6_GestionCamionesPendientes )]
        public async Task<bool> UpdateTransport([FromBody] TransporteDto transporte)
        {
            bool returnValue = false;
            transporte.ActualizadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
            var _transporte = await _iDAO_Transporte.Put(transporte);

            //if ( _transporte.IsGranel && _transporte.PesoEntrada > 0 && _transporte.PesoSalida > 0 && (_transporte.PesoSalida < _transporte.PesoEntrada))
            //{
            //    await AjustarLote(_transporte);
            //}

            hub.Clients.All.eventFinalizarDescargaTerminal();
            hub.Clients.All.eventFinalizarDescargaPortal();
            returnValue = _transporte != null ? true : false;
            return returnValue;
        }
        
        [Route("api/UpdateNombreArchivoAlbaranEntrada")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito, Funciones.ALM_PROD_DAT_6_GestionCamionesPendientes )]
        public async Task<IHttpActionResult> UpdateTransportNombreArchivoAlbaranEntrada([FromBody] DTO_ClaveValor transporte)
        {
            try
            {
                var result = await _iDAO_Transporte.PutNombreArchivoAlbaranEntrada(transporte);

                if (result.Exception != null)
                {
                    throw result.Exception;                    
                }

                return Ok(result.Data);
            }
            catch(Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "TransportController.UpdateTransportNombreArchivoAlbaranEntrada", "WEB-TRANSPORTES", "Sistema");

                return BadRequest();
            }
        }

        /// <summary>
        /// Elimiina (Actualiza) el estado de Activo a cero en la clase TransportDto
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [Route("api/DeleteTransport/{id}")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito, Funciones.ALM_PROD_DAT_6_GestionCamionesPendientes)]
        public async Task<int> DeleteTransport(int id)
        {
            try
            {
                int result = await _iDAO_Transporte.DeleteTransporte(id);
                hub.Clients.All.eventFinalizarDescargaTerminal();
                hub.Clients.All.eventFinalizarDescargaPortal();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_UNA"));
            }
        }

        //[Route("api/AjustarLote")]
        //[HttpPut]
        //[ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito, Funciones.ALM_PROD_DAT_6_CamionesPendientes)]
        //public async Task<bool> AjustarLote(TransporteDto transporte)
        //{
        //    bool returnValue = false;
        //    OperationDto operation = new OperationDto() {
        //        IdTransporte = transporte.IdTransporte,
        //        Cantidad = transporte.PesoSalida > transporte.PesoEntrada ? transporte.PesoSalida - transporte.PesoEntrada : transporte.PesoEntrada - transporte.PesoSalida,
        //        IdTipoOperacion = 19
        //    };
        //    var _transporte = await _iDAO_Transporte.AjustarLote(operation);
        //    returnValue = _transporte != null ? true : false;
        //    return returnValue;
        //}


        /// <summary>
        /// Metodo que obtiene todos el peso del transporte
        /// </summary>
        /// <returns>List of transport</returns>
        [Route("api/CaptureWeight")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito, Funciones.ALM_PROD_DAT_6_GestionCamionesPendientes)]
        public async Task<object> CaptureWeight()
        {
            List<string> filterList = new List<string>();
            filterList.Add("BASCULE_WEIGHT");
            RTDSValuesDto filter = new RTDSValuesDto() { Tags = filterList, Unit = "RTDS" };
            var weight = new object();
            try
            {
                weight = await _sitRTDS.readRTDS(filter);

            }
            catch (Exception e)
            {
            }
            return weight;
        }


        #region COLAS DE CAMIONES
        /// <summary>
        /// Metodo que obtiene los lotes segun el id de una ubicacion
        /// </summary>
        /// <param name="idUbicacion"></param>
        /// <returns></returns>
        [Route("api/GetLotesByIdUbicacion/{idUbicacion}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_5_ColasCamiones)]
        public async Task<List<LoteUbicacionDto>> GetLotesByIdUbicacion(int idUbicacion)
        {

            List<LoteUbicacionDto> listTransporte = await _iDAO_ColasCamiones.GetLotesByIdUbicacion(idUbicacion);
            if (listTransporte == null) listTransporte = new List<LoteUbicacionDto>();
           
            return listTransporte;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [Route("api/ActualizarColaLote")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_5_GestionColasCamiones)]
        public async Task<bool> ActualizarColaLote(TransporteDto _transporteUpdate)
        {
            try
            {
                var _result = await _iDAO_Transporte.PutFechaOrden(_transporteUpdate);
                hub.Clients.All.eventFinalizarDescargaTerminal();
                return _result;
            }
            catch (Exception ex)
            {
                throw new Exception(IdiomaController.GetResourceName("ERROR_ELIMINANDO_UNA"));
            }
        }



        [Route("api/FinalizarDescarga/{idLote}/{idAlbaran}")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_5_GestionColasCamiones)]
        public async Task<bool> FinalizarDescarga(string idLote, int idAlbaran)
        {

            if (idLote != null && idAlbaran != 0)
            {
                OperationDto opertation = new OperationDto()
                {
                    IdLote = idLote,
                    IdTipoOperacion = 8,
                    IdAlbaran = idAlbaran,
                    FechaDescarga = DateTime.Now
                };

                var _result = await _iDAO_Operations.PostOperation(opertation);
                if (_result != null) return true;
            }
            return false;
        }

        [Route("api/FinalizarDescargaByTransporte")]
        [HttpPut]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_5_GestionColasCamiones)]
        public async Task<bool> FinalizarDescargaByTransporte(TransporteDto transporte)
        {
            var _result = await FinalizarDescargaTransporte(transporte);
            hub.Clients.All.eventFinalizarDescargaTerminal();
            return _result;
        }


        [Route("api/FinalizarDescargaByTransporteAnonymous")]
        [HttpPut]
        [AllowAnonymous]
        public async Task<bool> FinalizarDescargaByTransporteAnonymous(TransporteDto transporte)
        {
            var _result = await FinalizarDescargaTransporte(transporte);
            hub.Clients.All.eventFinalizarDescargaPortal();
            return _result;
        }

        [Route("api/GetLotesByIdUbicacionAnonymous/{idUbicacion}")]
        [HttpGet]
        [AllowAnonymous]
        public async Task<List<LoteUbicacionDto>> GetLotesByIdUbicacionAnonymous(int idUbicacion)
        {

            List<LoteUbicacionDto> listTransporte = await _iDAO_ColasCamiones.GetLotesByIdUbicacion(idUbicacion);
            if (listTransporte == null) listTransporte = new List<LoteUbicacionDto>();
            return listTransporte;
        }

        private async Task<bool> FinalizarDescargaTransporte(TransporteDto transporte)
        {
            if (transporte != null)
            {
                if (transporte.IdTransporte != 0)
                {
                    var _result = await _iDAO_Transporte.FinalizarDescargaByTransporte(transporte);
                    if (_result) return true;
                }
            }
            return true;
        }

        #endregion


        #endregion


    }
}