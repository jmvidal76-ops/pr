using Autofac;
using Clients.ApiClient.Contracts;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.BBDD.Trazabilidad;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;
using Newtonsoft.Json;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public class DAO_Smile : IDAO_Smile
    {
        private IApiClient _api;
        private string _urlSmile;
        private string UriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();        

        public DAO_Smile()
        {

        }

        public DAO_Smile(IApiClient apiEnvasado)
        {
            _api = apiEnvasado;
            _urlSmile = string.Concat(UriEnvasado, "api/Smile/");
        }

        public async Task<DTO_RespuestaAPI<List<DTO_SolicitudSmile>>> ObtenerPeticionesMMPPSmile(DateTime fechaIni, DateTime fechaFin, string idLinea)
        {
            string fechaIniStr = fechaIni.ToString("yyyy-MM-ddTHH:mm:ss");
            string fechaFinStr = fechaFin.ToString("yyyy-MM-ddTHH:mm:ss");
            string urlConParametros = string.Concat(_urlSmile, "ObtenerPeticionesMMPPSmile?fechaIni=", fechaIniStr, "&fechaFin=", fechaFinStr, "&idLinea=", idLinea);

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_SolicitudSmile>>>(urlConParametros);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_SolicitudSmile>>> ObtenerPeticionesMMPPSmilePorParametros(int idSolicitud, string SSCC, string idLinea, string idMaterial)
        {
            // Normalizamos los parámetros para evitar null en la URL
            idLinea = string.IsNullOrEmpty(idLinea) ? "" : idLinea;
            SSCC = string.IsNullOrEmpty(SSCC) ? "" : SSCC;
            idMaterial = string.IsNullOrEmpty(idMaterial) ? "" : idMaterial;

            string urlConParametros = string.Concat(
                _urlSmile, "ObtenerPeticionesMMPPSmilePorParametros?",
                "idSolicitud=", idSolicitud,
                "&SSCC=", SSCC,
                "&idLinea=", idLinea,
                "&idMaterial=", idMaterial
            );

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_SolicitudSmile>>>(urlConParametros);

            return ret;
        }


        public async Task<DTO_RespuestaAPI<List<DTO_SolicitudCompletadosSmile>>> ObtenerSolicitudCompletadaSmile(int IdSolicitud)
        {
            string urlConParametros = string.Concat(_urlSmile, "ObtenerSolicitudCompletadaSmile?IdSolicitud=", IdSolicitud);

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_SolicitudCompletadosSmile>>>(urlConParametros);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> ActualizarEstadoPeticionSmile(int IdSolicitud, int IdEstadoSolicitud, string Usuario)
        {
            string urlConParametros = string.Concat(_urlSmile, "ActualizarEstadoPeticionSmile?IdPeticion=", IdSolicitud, "&IdEstadoSolicitud=", IdEstadoSolicitud, "&Usuario=", Usuario);
            var jsonResult = await _api.PatchPostsAsync<dynamic>(true, IdSolicitud,urlConParametros);

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }
        public async Task<DTO_RespuestaAPI<List<DTO_StockSmile>>> ObtenerStockMMPPSmile(string IdProducto, string IdLinea, string IdMaterial, string IdZona, bool AgruparMMPP)
        {
            var idproducto = IdProducto != null ? IdProducto : "";
            var idLinea = IdLinea != null ? IdLinea : "";
            var idMaterial = IdMaterial != null ? IdMaterial : "";
            var idZona = IdZona != null ? IdZona : "";

            string urlConParametros = string.Concat(_urlSmile, "ObtenerStockMMPPSmile?IdProducto=", idproducto, "&IdLinea=", idLinea, "&IdMaterial=", idMaterial, "&IdZona=", idZona, "&AgruparMMPP=", AgruparMMPP);

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_StockSmile>>>(urlConParametros);

            return ret;
        }
        public async Task<DTO_RespuestaAPI<bool>> CrearPeticionSmile(DTO_SolicitudSmile Peticion)
        {
            var jsonResult = await _api.PostPostsAsync<dynamic>(Peticion, string.Concat(_urlSmile + "CrearSolicitudSmile"));

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }
        public async Task<DTO_RespuestaAPI<bool>> EnviarSolicitudes()
        {
            var jsonResult = await _api.PostPostsAsync<dynamic>(true, string.Concat(_urlSmile + "EnviarSolicitudes"));

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> CrearDevolucionesSmile(DTO_SolicitudSmile Peticion)
        {
            var jsonResult = await _api.PostPostsAsync<dynamic>(Peticion, string.Concat(_urlSmile + "CrearSolicitudSmile"));

            var json = jsonResult.ToString();
            var ret = JsonConvert.DeserializeObject<DTO_RespuestaAPI<bool>>(json);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_MaestroClaseSubClaseMMPPUbicacion>>> ObtenerDatosMaestroClaseSubClaseMMPPUbicacion(string idLinea)
        {
            string urlConParametros = string.Concat(_urlSmile, "ObtenerDatosMaestroClaseSubClaseMMPPUbicacion?idLinea=", idLinea);

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_MaestroClaseSubClaseMMPPUbicacion>>>(urlConParametros);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_MaestroClaseSubClaseMMPPUbicacion>>> ObtenerDatosMaestroClaseSubClaseMMPPUbicacion(string idLinea, string material)
        {
            string urlConParametros = string.Concat(_urlSmile, "ObtenerDatosMaestroClaseSubClaseMMPPUbicacionMaterial?idLinea=", idLinea, "&idMaterial=", material);

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_MaestroClaseSubClaseMMPPUbicacion>>>(urlConParametros);

            return ret;
        }
    }
}