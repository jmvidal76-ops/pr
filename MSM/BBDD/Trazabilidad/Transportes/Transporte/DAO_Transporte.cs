using Clients.ApiClient.Contracts;
using Common.Models.LoteUbicacion;
using Common.Models.Matricula;
using Common.Models.Operation;
using Common.Models.Transportes;
using Common.Models.Transportista;
using Microsoft.AspNet.SignalR;
using MSM.Mappers.DTO;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public class DAO_Transporte : IDAO_Transporte
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriTransporte ;
        private string UriFinalizarDescarga;
        private string UriMatriculas ;
        private string UriTransportistas ;
        private string UriAjustarLote;
        private string UriOperation;
        private string UriUpdateNombreArchivoAlbaranEntrada;
        private IApiClient _apiTrazabilidad;

        public IHubContext hub = GlobalHost.ConnectionManager.GetHubContext<MSMHub>();

        public DAO_Transporte(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriTransporte = UriBase + "api/transporte";
            UriTransportistas = UriTransporte + "/transportistas/filters";
            UriFinalizarDescarga = UriTransporte + "/UpdateFechaOrden";
            UriAjustarLote = UriTransporte + "/AjustarLote";
            UriUpdateNombreArchivoAlbaranEntrada = UriTransporte + "/UpdateNombreArchivoAlbaranEntrada";
            UriOperation = UriBase + "api/operation";
        }

        public async Task<List<TransporteDto>> GetTransports()
        {
            List<TransporteDto> ret = new List<TransporteDto>();
            try
            {
                 ret = await _apiTrazabilidad.GetPostsAsync<List<TransporteDto>>(UriTransporte + "/transito");
            }
            catch(Exception ex)
            {

            }
           
            return ret;
        }

        public async Task<List<TransporteDto>> GetHistoricoTransportes(DateTime fechaInicio, DateTime fechaFin) {

            string uri = string.Concat(UriTransporte, "/finalizados?fechaInicio=", fechaInicio.ToUniversalTime().ToString("u"), "&fechaFin=", fechaFin.ToUniversalTime().ToString("u"));
            var ret = await _apiTrazabilidad.GetPostsAsync<List<TransporteDto>>(uri);
            return ret;
        }

        public async Task<TransporteDto> GetUltimoTransporte(int idMatricula, int tipoOperacion)
        {

            string uri = string.Concat(UriTransporte, "/ultimo?idMatricula=", idMatricula.ToString(), "&tipoOperacion=", tipoOperacion.ToString());
            var ret = await _apiTrazabilidad.GetPostsAsync<TransporteDto>(uri);
            return ret;
        }

        //public async Task<List<TransporteDto>> GetTransportesPendientes()
        //{
        //    var ret = await _apiTrazabilidad.GetPostsAsync<List<TransporteDto>>(UriTransporte + "/pendientes");
        //    return ret;
        //}

        public async Task<int> DeleteTransporte(int id)
        {
            string Uri = id != 0 ? UriTransporte + "/" + id : UriTransporte;
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(Uri);

            hub.Clients.All.actualizarCamionesTransito(new { idTransporte = id });

            return ret;
        }

        public async Task<TransporteDto> Post(TransporteDto transporte)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<TransporteDto>(transporte, UriTransporte);

            hub.Clients.All.actualizarCamionesTransito(new { idTransporte = transporte.IdTransporte });

            return ret;
        }

        public async Task<TransporteDto> Put(TransporteDto transporte)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<TransporteDto>(UriTransporte, transporte);

            hub.Clients.All.actualizarCamionesTransito(new { idTransporte = transporte.IdTransporte });

            return ret;
        }

        public async Task<bool> FinalizarTransporte(TransporteDto transporte)
        {
            var uri = UriTransporte + "/finalizar";
            var ret = await _apiTrazabilidad.PutPostsAsync(uri, transporte);

            hub.Clients.All.actualizarCamionesTransito(new { idTransporte = transporte.IdTransporte });

            return true;
        }

        public async Task<List<LoteUbicacionDto>> GetLotesByIdUbicacion(int idUbicacion) {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<LoteUbicacionDto>>(UriTransporte + "/loteUbicacion");
            return ret;
        
        }

        public async Task<bool> FinalizarDescargaByTransporte(TransporteDto transporte) 
        {
            var uri = UriTransporte + "/finalizarDescargaByTransporte/" + transporte.IdTransporte;
            var ret = await _apiTrazabilidad.PutPostsAsync(uri, transporte);
            return true;
        }

         public async Task<bool> PutFechaOrden(TransporteDto transporte)
         {
             var ret = await _apiTrazabilidad.PutPostsAsync(UriFinalizarDescarga + "/" + transporte.IdTransporte, transporte);
             return true;
        }
        public async Task<DTO_RespuestaAPI<bool>> PutNombreArchivoAlbaranEntrada(DTO_ClaveValor transporte)
        {
            var ret = await _apiTrazabilidad.PutPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(UriUpdateNombreArchivoAlbaranEntrada, transporte);
            return ret;
        }

        public async Task<bool> AjustarLote(OperationDto operation) {
             var ret = await _apiTrazabilidad.PostPostsAsync<OperationDto>(operation,UriOperation);
             return true;
         
         }

    }
}