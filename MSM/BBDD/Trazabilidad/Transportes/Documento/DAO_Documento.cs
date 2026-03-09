using Clients.ApiClient.Contracts;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Documento
{
    public class DAO_Documento : IDAO_Documento
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriDocumento ;
        private string UriTipoDocumento ;
        private string UriDocumentosByIdTransporte ;
        private string UriFichero ;
        
        private IApiClient _apiTrazabilidad;

        public DAO_Documento(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriDocumento = UriBase + "api/documento";
            UriTipoDocumento = UriDocumento + "/tipoDocumento";
            UriDocumentosByIdTransporte = UriDocumento + "/documentos";
            UriFichero = UriDocumento + "/fichero";
            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }

        public async Task<DocumentoDto> Get(int id)
        {
            string Uri = id != 0 ? UriDocumento + "/" + id : UriDocumento;
            var ret = await _apiTrazabilidad.GetPostsAsync<DocumentoDto>(Uri);
            return ret;
        }

        public async Task<List<DocumentoDto>> GetDocumentosByIdTransporte(int idTransporte)
        {
            string Uri = idTransporte != 0 ? UriDocumentosByIdTransporte + "/" + idTransporte : UriDocumento;
            var ret = await _apiTrazabilidad.GetPostsAsync<List<DocumentoDto>>(Uri);
            return ret;
        }

        public async Task<byte[]> GetFicheroByIdDocumento(int id)
        {
            string Uri = id != 0 ? UriFichero + "/" + id : UriDocumento;
            var ret = await _apiTrazabilidad.GetPostsAsync<byte[]>(Uri);
            return ret;
        }

        public async Task<List<TipoDocumentoDto>> GetTipoDocumentoAll()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<TipoDocumentoDto>>(UriTipoDocumento);
            return ret;
        }

        public async Task<DocumentoDto> Post(DocumentoDto documento)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<DocumentoDto>(documento, UriDocumento);
            return ret;
        }

        public async Task<DocumentoDto> Put(DocumentoDto documento)
        {
            string Uri = documento.IdDocumento != 0 ? UriDocumento + "/" + documento.IdDocumento : UriDocumento;
            var ret = await _apiTrazabilidad.PutPostsAsync<DocumentoDto>(Uri, documento);
            return ret;
        }

        public async Task<int> DeleteFicheroByIdDocumento(int idDocumento)
        {
            string Uri = idDocumento != 0 ? UriFichero + "/" + idDocumento : UriDocumento;
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(Uri);
            return ret;
        }

        public async Task<int> Delete(int idDocumento)
        {
            string Uri = idDocumento != 0 ? UriDocumento + "/" + idDocumento : UriDocumento;
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(Uri);
            return ret;
        }
    }
}