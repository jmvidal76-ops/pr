using Clients.ApiClient.Contracts;
using Common.Models.Lote;
using Common.Models.LoteUbicacion;
using Common.Models.Operation;
using Common.Models.Ubicaciones;
using MSM.BBDD.Almacen.ColasCamiones;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Almacen.ColasCamiones
{
    public class DAO_ColasCamiones : IDAO_ColasCamiones
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriColasCamiones;
        private string UriLotesUbicacion;
        private string UriUbicacionesDescarga;
        private string UriAlbaranPosicion;

        private IApiClient _apiTrazabilidad;

        public DAO_ColasCamiones(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriColasCamiones = UriBase + "api/colaCamiones";
            UriLotesUbicacion = UriColasCamiones + "/lotesUbicacion";
            UriUbicacionesDescarga = UriColasCamiones + "/ubicacionesDescarga";
            UriAlbaranPosicion = UriBase + "api/albaranPosicionLote";
        }


        public async Task<List<UbicacionDescargaDto>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<UbicacionDescargaDto>>(UriUbicacionesDescarga);
            return ret;
        }

        

        public async Task<List<LoteUbicacionDto>> GetLotesByIdUbicacion(int idUbicacion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<LoteUbicacionDto>>(UriLotesUbicacion + "/" + idUbicacion.ToString());
            return ret;
        }

        public async Task<bool> Put(LotePositionDto lote)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync(UriAlbaranPosicion, lote);
            return true;
        }

    }
}