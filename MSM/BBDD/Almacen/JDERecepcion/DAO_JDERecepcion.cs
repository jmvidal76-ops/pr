using Clients.ApiClient.Contracts;
using Common.Models.Almacen;
using Common.Models.Lote;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Almacen.JDERecepcion
{
    public class DAO_Albaran : IDAO_JDERecepcion
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriJDERecepcion ;
        private string UriLoteSinCodigoJDE;
        private string UriGenerarLotes;

        private string UriJDEPropiedadRecepcion;
        
        private IApiClient _apiTrazabilidad;

        public DAO_Albaran(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriJDERecepcion = UriBase + "api/JDERecepcionMaterial";
            UriJDEPropiedadRecepcion = UriBase + "api/JDERecepcionPropiedades";
            UriLoteSinCodigoJDE = UriBase + "api/loteSinCodigoJDE";
            UriGenerarLotes = UriBase + "api/CodigoJDE/GenerarLotesSinCodigoJDE";
            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }

        //public async Task<AlbaranDto> Post(AlbaranDto albaran) 
        //{
        //    var ret = await _apiTrazabilidad.PostPostsAsync<AlbaranDto>(albaran, UriAlbaran);
        //    return ret;
        
        //}

        public async Task<List<JDERecepcionMaterialDto>> Get(DateTime FechaInico, DateTime FechaFin)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<JDERecepcionMaterialDto>>(UriJDERecepcion + "/" + FechaInico.ToString("yyyyMMddTHHmm") + "/" + FechaFin.ToString("yyyyMMddTHHmm"));
            return ret;

        }


        public async Task<List<JDEPropiedadRecepcionDto>> GetProperties(string codigoRecepcion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<JDEPropiedadRecepcionDto>>(UriJDEPropiedadRecepcion+"/"+codigoRecepcion);
            return ret;

        }


       
        //public async Task<int> Delete(int idAlbaran)
        //{
        //    string Uri = idAlbaran != 0 ? UriAlbaran + "/" + idAlbaran : UriAlbaran;
        //    var ret = await _apiTrazabilidad.DeletePostsAsync<int>(Uri);
        //    return ret;
        //}

        public async Task<List<LoteSinCodigoJDEDto>> ObtenerLoteSinCodigoJDE()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<LoteSinCodigoJDEDto>>(UriLoteSinCodigoJDE);
            return ret;

        }

        public async Task ActualizarLoteSinCodigoJDE(LoteSinCodigoJDEDto lote)
        {
            await _apiTrazabilidad.PutPostsAsync(UriLoteSinCodigoJDE,lote);
        }

        public async Task<List<long>> GenerarLotesSinCodigoJDE(List<long> dto)
        {
            return await _apiTrazabilidad.PostPostsAsync(dto, UriGenerarLotes);
        }

    }
}