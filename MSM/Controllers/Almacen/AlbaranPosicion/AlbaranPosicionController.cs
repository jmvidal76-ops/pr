using Common.Models.AlbaranPosicion;
using Common.Models.Material;
using Common.Models.Operation;
using Common.Models.Transportes;
using MSM.BBDD.Trazabilidad.Albaran;
using MSM.BBDD.Trazabilidad.AlbaranPosicion;
using MSM.BBDD.Trazabilidad.Operations;
using MSM.BBDD.Trazabilidad.Transporte;
using MSM.Models.Trazabilidad;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen.AlbaranPosicion
{
    public enum TipoOrigenEnum
    {
        ClienteAlbaranPosicion
    }

    public enum ParametrosAlbaranEnum
    {
        IPServidor,
        RutaReport,
        LogoEmpresa,
        SelloEmpresa,
        NombreEmpresa,
        NIFEmpresa,
        DireccionEmpresa,
        PoblacionEmpresa,
        CodPostalEmpresa,
        NombreCentro,
        AbrevCentro,
        RutaJustificante
    }

    [Authorize]
    public class AlbaranPosicionController : ApiController
    {
        private readonly IDAO_AlbaranPosicion _iDAO_AlbaranPosicion;
        private readonly IDAO_Operations _iDAO_Operacion;
        private readonly IDAO_Albaran _iDAO_Albaran;
        Microsoft.AspNet.SignalR.IHubContext hub = Microsoft.AspNet.SignalR.GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public AlbaranPosicionController(IDAO_AlbaranPosicion iDAO_AlbaranPosicion, IDAO_Operations iDAO_Operacion, IDAO_Albaran iDAO_Albaran)
                    {
                        _iDAO_AlbaranPosicion = iDAO_AlbaranPosicion;
                        _iDAO_Operacion = iDAO_Operacion;
                        _iDAO_Albaran = iDAO_Albaran;
                    }


         /// <summary>
         /// Metodo que obtiene los albaranes segun el ID de transporte
         /// </summary>
         /// <returns></returns>
         [Route("api/GetDeliveryNotes/{idTransporte}/{tipo}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<AlbaranDto>> GetDeliveryNotes(int idTransporte, int tipo = 0)
         {
            List<AlbaranDto> listAlbaranEntrada = new List<AlbaranDto>();
            try
            {
                if (idTransporte != 0)
                {
                    listAlbaranEntrada = await _iDAO_AlbaranPosicion.GetAlbaranPosicionByIdTransporte(idTransporte, tipo);

                }
            }
            catch(Exception ex)
            {

            }
             
            
             return listAlbaranEntrada;
         }

         /// <summary>
         /// Metodo que agrega un nuevo albaran
         /// </summary>
         /// <param name="documento">Objeto de tipo DocumentoDto</param>
         /// <returns></returns>
         [Route("api/AddDeliveryNotes")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<AlbaranDto> AddDeliveryNotes(AlbaranDto albaran)
         {
            albaran.Activo = true;
             await _iDAO_AlbaranPosicion.PostAlbaranPosicion(albaran);
                        
                     //hub.Clients.All.eventFinalizarDescargaTerminal();
                     //hub.Clients.All.eventFinalizarDescargaPortal();
             return albaran;
         }

        /// <summary>
        /// Metodo privado que obtiene el Id de Albaran según un AlbaranPosicionDto
        /// </summary>
        /// <param name="albaran"></param>
        /// <returns></returns>
         private async Task<int> GetIdAlbaran(AlbaranPosicionDto albaran)
         {
             AlbaranDto _albaranDto = new AlbaranDto()
             {
                 IdTransporte = albaran.IdTransporte,
                 IdTipo = albaran.IdTipoAlbaran,
                 Activo = true
             };
             AlbaranDto _albaranNew = new AlbaranDto();
             try
             {
                 _albaranNew = await _iDAO_Albaran.Post(_albaranDto);
                 albaran.IdAlbaran = _albaranNew.IdAlbaran;
             }
             catch (Exception e)
             {

             }

             if (_albaranNew.IdAlbaran == null)
             {
                 _albaranNew = await _iDAO_Albaran.Get(albaran.IdTransporte, albaran.IdTipoAlbaran);
                 albaran.IdAlbaran = _albaranNew.IdAlbaran;

             }
             return albaran.IdAlbaran;
         }


         /// <summary>
         /// Metodo que elimina el albaran seleccionado
         /// </summary>
         /// <param name="documento">Objeto de tipo DocumentoDto</param>
         /// <returns></returns>
         [Route("api/DeleteDeliveryNote")]
         [HttpPut]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<bool> DeleteDeliveryNote(AlbaranPosicionDto albaranPosicion)
         {
             if (albaranPosicion.IdAlbaran != 0)
             {
                
                  await _iDAO_AlbaranPosicion.DeleteAlbaranPosicion(albaranPosicion.IdAlbaran);
             }

             hub.Clients.All.eventFinalizarDescargaTerminal();
             hub.Clients.All.eventFinalizarDescargaPortal();
             return true;
         }





         /// <summary>
         /// Metodo que obtiene la lista de las Ordenes de Aprovisionamiento (OA)
         /// </summary>
         /// <returns></returns>
         [Route("api/GetOA/{refMaterial}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<OrdenAprovisionamientoDto>> GetOA(string refMaterial)
         {
             List<dynamic> _list = new List<dynamic>();
             dynamic listOA = refMaterial != "undefined" && refMaterial != null ? await _iDAO_AlbaranPosicion.GetSuplyOrders(refMaterial):null;
             //dynamic listOA = refMaterial != "undefined" && refMaterial != null ? await _iDAO_AlbaranPosicion.GetSuplyOrders("0100084") : null;
             _list = listOA != null ? listOA : _list;

             if (_list != null) {
                 List<OrdenAprovisionamientoDto> _listOA = new List<OrdenAprovisionamientoDto>();
               
                 foreach (var item in _list)
	                {

                        OrdenAprovisionamientoDto _orden = new OrdenAprovisionamientoDto();
                        _orden.IdOrdenAprovisionamiento = item.Descripcion.Value;
                        _orden.IdTipoOrdenAprovisionamiento = item.OrderType.Value == "OA" ? 1 : item.OrderType.Value == "ST" ? 2 : 3;
                        _orden.TipoOrden = new TipoOrdenAprovisionamientoDto()
                            {
                                IdTipoOrdenAprovisionamiento = item.OrderType.Value == "OA" ? 1 : item.OrderType.Value == "ST" ? 2 : 3,
                                Tipo = item.OrderType.Value
                                
                            };
                        _orden.Proveedor = item.Provider.Value;
                        _orden.CantidadPendiente = item.RemainingQuantity;
                        _orden.Descripcion = item.Descripcion.Value;
                        _orden.UnidadMedida = item.UnitOfMeasure.Value;
                        _listOA.Add(_orden);
	                }


                 return _listOA;
             }

             return null;
         }

         /// <summary>
         /// Metodo que actualiza el albaran
         /// </summary>
         /// <param name="albaran">Objeto de tipo AlbaranDto</param>
         /// <returns></returns>
         [Route("api/UpdateDeliveryNotes")]
         [HttpPut]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<AlbaranDto> UpdateDeliveryNotes(AlbaranDto albaran)
         {
             if (albaran.IdAlbaran != 0)
             {
                return  await _iDAO_AlbaranPosicion.Put(albaran);
             }
             return albaran;
         }

         [Route("api/GetAllReceptionDeliveryNotes/{idMaterial}/")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<OperationDto>> GetAllReceptionDeliveryNotes(string idMaterial)
         {
             List<OperationDto> listAlbaranEntrada = new List<OperationDto>();
             List<OperationDto> operation = await _iDAO_AlbaranPosicion.GetAllAlbaranPosicion(idMaterial);
                 if (operation.Count > 0)
                 {
                     listAlbaranEntrada = operation;
                 }
             
             return listAlbaranEntrada;
         }


         /// <summary>
         /// Metodo que agrega un nuevo lote
         /// </summary>
         /// <param name="documento">Objeto de tipo DocumentoDto</param>
         /// <returns></returns>
         [Route("api/AddReceptionDeliveryNotes")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito, Funciones.ALM_PROD_DAT_3_GestionControlStock, 
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion, Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
         public async Task<OperationDto> AddReceptionDeliveryNotes(OperationDto lote)
         {
             if (lote != null)
             {
                 try
                 {
                     lote.FechaEntrada = DateTime.Now;
                     lote.FechaInicio = lote.FechaEntrada;
                     lote.IdUbicacionDestino = lote.Ubicacion.IdUbicacion;
                     lote.Cantidad = lote.CantidadActual;
                     lote.UnidadesMedida = lote.UnidadesMedidaDto.TargetUoMID;
                     lote.IdTipoOperacion = 1;//AGREGAR
                     lote.Location = lote.Ubicacion.IdUbicacionLinkMes;
                     lote.FechaDescarga = null;
                     lote.SSCC = String.IsNullOrEmpty(lote.SSCC) ? null : lote.SSCC;
                     lote.FechaCaducidad = lote.FechaCaducidad.HasValue ? lote.FechaCaducidad : null;
                     return await _iDAO_Operacion.PostOperation(lote);
                 }
                 catch (Exception e) { 
                 
                 }
             }
             return null;
         }

        /// <summary>
        /// Metodo que obtiene un diccionario de propiedades extendidas
        /// </summary>
        /// <param name="_listPropiedadesExtendidas"></param>
        /// <returns></returns>
        private Dictionary<string,string> GetDictionaryPropertiesExtended(List<PropiedadesExtendidasDto> _listPropiedadesExtendidas)
        {
                if (_listPropiedadesExtendidas != null)
                {
                    if (_listPropiedadesExtendidas.Count > 0)
                    {
                        Dictionary<string, string> _dicPropExt = new Dictionary<string, string>();
                        foreach (var item in _listPropiedadesExtendidas)
                        {
                            _dicPropExt.Add(item.PropertyID, item.PropValChar);
                        }
                        return  _dicPropExt;
                    }
                }
            return null;
        }

         /// <summary>
         /// Metodo que modifica un lote
         /// </summary>
         /// <param name="documento">Objeto de tipo DocumentoDto</param>
         /// <returns></returns>
         [Route("api/UpdateReceptionDeliveryNotes")]
         [HttpPut]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<OperationDto> UpdateReceptionDeliveryNotes(OperationDto lote)
         {
             if (lote != null)
             {
                 try
                 {
                     //AJUSTAR CANTIDAD
                     lote.FechaEntrada = DateTime.Now;
                     lote.FechaInicio = lote.FechaEntrada;
                     lote.IdUbicacionDestino = lote.Ubicacion.IdUbicacion;
                     lote.IdUbicacionOrigen = lote.Ubicacion.IdUbicacion;
                     lote.Proceso = "REC";
                     lote.Cantidad = lote.CantidadActual * lote.UnidadesMedidaDto.Factor;
                     lote.UnidadesMedida = lote.UnidadesMedidaDto.TargetUoMID;
                     lote.IdTipoOperacion = 8; //MODIFICACION
                     lote.Location = lote.Ubicacion.IdUbicacionLinkMes;
                     lote.FechaDescarga = null;
                     lote.FechaCaducidad = lote.FechaCaducidad.HasValue ? lote.FechaCaducidad : null;
                    var operation = await _iDAO_Operacion.PostOperation(lote);
                    if (operation != null) {
                        lote.IdTipoOperacion = 2;
                        return await _iDAO_Operacion.PostOperation(lote);
                    }
                 }
                 catch (Exception e)
                 {

                 }
             }
             return null;

         }

         /// <summary>
         /// Metodo que elimina un lote
         /// </summary>
         /// <param name="documento">Objeto de tipo OperationDto</param>
         /// <returns></returns>
         [Route("api/DeleteReceptionDeliveryNote")]
         [HttpPut]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<OperationDto> DeleteReceptionDeliveryNote(OperationDto lote)
         {

             if (lote != null)
             {
                 try
                 {
                     lote.FechaEntrada = DateTime.Now;
                     lote.FechaInicio = lote.FechaEntrada;
                     lote.IdUbicacionDestino = lote.Ubicacion.IdUbicacion;
                     lote.IdUbicacionOrigen = lote.Ubicacion.IdUbicacion;
                     lote.Proceso = "REC";
                     lote.Cantidad = lote.CantidadActual * lote.UnidadesMedidaDto.Factor;
                     lote.UnidadesMedida = lote.UnidadesMedidaDto.TargetUoMID;
                     lote.IdTipoOperacion = 17;//ELIMINAR LOTE
                     lote.Location = lote.Ubicacion.IdUbicacionLinkMes;
                     lote.FechaDescarga = lote.IsGranel ? (DateTime?)null : DateTime.Now;
                     return await _iDAO_Operacion.PostOperation(lote);
                 }
                 catch (Exception e)
                 {

                 }
             }
             return null;

         }

         [Route("api/GetFormsByIdAlbaranPosicion/{idAlbaranPosicion}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<List<AlbaranPosicionCalidadDto>> GetFormsByIdAlbaranPosicion(int idAlbaranPosicion)
         {
             var listAlbaranPosicionCalidad = await _iDAO_AlbaranPosicion.GetFormsByIdAlbaranPosicion(idAlbaranPosicion);
             //List<AlbaranPosicionCalidadDto> listAlbaranPosicionCalidad = new List<AlbaranPosicionCalidadDto>();
             //listAlbaranPosicionCalidad.Add(new AlbaranPosicionCalidadDto()
             //{
             //    ID = 12329,
             //    IdAlbaranPosicion = 1078,
             //    statusID = 1,
             //    name = "clase generico XXX",
             //    FormTemplate = ({"ID":58,"name":"referencia XXX","countFields":1,"descript":"Albaran referencia XXX","fieldsTemplate":[],"typeID":"PLANTA"})
             //});
             return listAlbaranPosicionCalidad;
         }

         [Route("api/GetAlbaranPosicionLoteByFilter/{filter}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<AlbaranPosicionDto>> GetAlbaranPosicionLoteByFilter(string filter, string value = null)
         {
             if (value != null)
             {
                 return await _iDAO_AlbaranPosicion.GetAlbaranPosicionLoteByFilters(value, filter);
             }
             else {
                 return new List<AlbaranPosicionDto>();
             }
         }


         [Route("api/GetAlbaranPosicionLoteNoConsumidos/{consumido}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_3_GestionControlStock, Funciones.ALM_PROD_DAT_3_VisualizacionControlStock, 
            Funciones.ENV_PROD_EXE_54_VisualizacionControlStockMMPP, Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP)]
         public async Task<List<AlbaranPosicionDto>> GetAlbaranPosicionLoteNoConsumidos(string consumido)
         {
             if (consumido == "0")
             {
                 return await _iDAO_AlbaranPosicion.GetAlbaranPosicionLoteNoConsumido();

             }
             else {
                 return await _iDAO_AlbaranPosicion.GetAlbaranPosicionLotesConsumidos();
             }
                
            
         }

    }
}