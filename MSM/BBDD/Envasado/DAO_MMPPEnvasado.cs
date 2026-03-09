using Clients.ApiClient.Contracts;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.Utilidades;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Threading;
using System.Threading.Tasks;

namespace MSM.BBDD.Envasado
{
    public sealed class DAO_MMPPEnvasado : IDAO_MMPPEnvasado
    {
        private IApiClient _api;
        private string BaseEnvasado;
        public DAO_MMPPEnvasado()
        {
            throw new InvalidOperationException(
                "Este constructor no puede usarse porque requiere IApiClient. Use el constructor DAO_MMPPEnvasado(IApiClient api).");
        }
        public DAO_MMPPEnvasado(IApiClient apiEnvasado)
        {
            _api = apiEnvasado ?? throw new ArgumentNullException(nameof(apiEnvasado));
            string _uriEnvasado = (ConfigurationManager.AppSettings["HostApiEnvasado"] ?? "").ToString();

            if (string.IsNullOrWhiteSpace(_uriEnvasado))
                throw new Exception("HostApiEnvasado no está configurado en appSettings.");

            BaseEnvasado = (_uriEnvasado ?? string.Empty).TrimEnd('/') + "/api/Envasado/";
        }

        private async Task<DTO_RespuestaAPI<T>> SafeGet<T>(string endpointWithQuery, CancellationToken ct)
        {
            ct.ThrowIfCancellationRequested();
            
            var url = BaseEnvasado + endpointWithQuery.TrimStart('/');
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<T>>(url);

            ct.ThrowIfCancellationRequested();
            return result;
        }
        private async Task<DTO_RespuestaAPI<T>> SafePost<T>(string endpoint, object body, CancellationToken ct)
        {
            ct.ThrowIfCancellationRequested();

            var url = BaseEnvasado + endpoint.TrimStart('/');
            var raw = await _api.PostPostsAsync<object>(body, url);
            if (raw == null)
            {
                return new DTO_RespuestaAPI<T>
                {
                    Data = default,
                    Exception = new Exception($"Respuesta nula de la API externa en {endpoint}")
                };
            }

            ct.ThrowIfCancellationRequested();
            return Utils.Deserialize<DTO_RespuestaAPI<T>>(raw);
        }

        public async Task<DTO_RespuestaAPI<List<DTO_SolicitudMMPPEnvasado>>> ObtenerPeticionesMMPPEnvasado(DateTime fechaIni, DateTime fechaFin, string idLinea, CancellationToken ct)
        {
            string fechaIniStr = fechaIni.ToString("yyyy-MM-ddTHH:mm:ss");
            string fechaFinStr = fechaFin.ToString("yyyy-MM-ddTHH:mm:ss");
            string urlConParametros = $"ObtenerPeticionesMMPPEnvasado" +
                $"?fechaIni={fechaIniStr}" +
                $"&fechaFin={fechaFinStr}" +
                $"&idLinea={idLinea}";            

            return await SafeGet<List<DTO_SolicitudMMPPEnvasado>>(urlConParametros, ct);
        }
        public Task<DTO_RespuestaAPI<List<DTO_SolicitudMMPPEnvasado>>> ObtenerPeticionesMMPPEnvasadoPorParametros(int idSolicitud, string SSCC, string idLinea, string idMaterial)
        {
            throw new NotImplementedException();
        }

        public Task<DTO_RespuestaAPI<List<DTO_SolicitudCompletadosMMPPEnvasado>>> ObtenerSolicitudCompletadaMMPPEnvasado(int idSolicitud, CancellationToken ct)
        {
            throw new NotImplementedException();
        }
        public Task<DTO_RespuestaAPI<bool>> ActualizarEstadoPeticionMMPPEnvasado(int idSolicitud, int idEstadoSolicitud, string usuario, CancellationToken ct)
        {
            throw new NotImplementedException();
        }
        public async Task<DTO_RespuestaAPI<List<DTO_StockEnvasado>>> ObtenerStockMMPPEnvasado(string idProducto, string idLinea, string idMaterial, string idZona, bool agruparMMPP, CancellationToken ct)
        {
            var idproducto = idProducto ?? string.Empty;
            var idlinea = idLinea ?? string.Empty;
            var idmaterial = idMaterial ?? string.Empty;
            var idzona = idZona ?? string.Empty;


            string urlConParametros = 
                "ObtenerStockMMPPEnvasado" + 
                $"?idProducto={Utils.Encode(idproducto)}"+
                $"&idLinea={Utils.Encode(idlinea)}"+
                $"&idMaterial={Utils.Encode(idmaterial)}"+
                $"&idZona={Utils.Encode(idzona)}"+
                $"&agruparMMPP={agruparMMPP.ToString().ToLower()}";            

            return await SafeGet<List<DTO_StockEnvasado>>(urlConParametros, ct);
        }
        public async Task<DTO_RespuestaAPI<bool>> CrearPeticionMMPPEnvasado(DTO_SolicitudMMPPEnvasado peticion, CancellationToken ct)
        {
            if (peticion == null)
                return new DTO_RespuestaAPI<bool>
                {
                    Data = false,
                    Exception = new ArgumentNullException(nameof(peticion))
                };

            return await SafePost<bool>("CrearSolicitudMMPPEnvasado", peticion, ct);
        }
        public async Task<DTO_RespuestaAPI<bool>> EnviarSolicitudes(CancellationToken ct)
        {            
            return await SafePost<bool>("EnviarSolicitudes", true, ct);            
        }

        public async Task<DTO_RespuestaAPI<bool>> CrearDevolucionesMMPPEnvasado(DTO_SolicitudMMPPEnvasado Peticion)
        {
            if (Peticion == null)
                return new DTO_RespuestaAPI<bool>
                {
                    Data = false,
                    Exception = new ArgumentNullException(nameof(Peticion))
                };

            // Las devoluciones se registran como tipo 2 en el mismo flujo de Envasado.
            Peticion.IdTipoSolicitud = 2;
            if (Peticion.IdEstadoSolicitud <= 0)
                Peticion.IdEstadoSolicitud = 1;

            return await SafePost<bool>("CrearSolicitudMMPPEnvasado", Peticion, CancellationToken.None);
        }

        public async Task<DTO_RespuestaAPI<List<DTO_MaestroClasesUbicaciones>>> ObtenerDatos_MaestroClasesUbicaciones(string idLinea, string material, CancellationToken ct)
        {
            string urlConParametros =
                "ObtenerDatos_MaestroClasesUbicaciones" +
                $"?idLinea={Utils.Encode(idlinea)}" +
                $"&idMaterial={Utils.Encode(material)}";

            return await SafeGet<List<DTO_MaestroClasesUbicaciones>>(urlConParametros, ct);
        }
    }
}


