using Clients.ApiClient.Contracts;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.ControlGestion;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.ControlGestion
{
    public class DAO_ControlGestion : IDAO_ControlGestion
    {
        private IApiClient _api;
        private string _urlControlGestionFab;
        private string _urlControlGestionTra;
        private string uriFabricacion = ConfigurationManager.AppSettings["HostApiFabricacion"].ToString();
        private string uriTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();

        public DAO_ControlGestion()
        {

        }
        public DAO_ControlGestion(IApiClient api)
        {
            _api = api;
            _urlControlGestionFab = string.Concat(uriFabricacion, "api/ControlGestion/");
            _urlControlGestionTra = string.Concat(uriTrazabilidad, "api/ControlGestion/");
        }

        #region Fabricacion

        public async Task<List<DTO_ConsumoMMPPCoccion>> ObtenerConsumosMMPPCoccion(DateTime fechaDesde, DateTime fechaHasta)
        {
            var result = await _api.GetPostsAsync<List<DTO_ConsumoMMPPCoccion>>(string.Concat(_urlControlGestionFab, "ConsumosMMPPCoccion?fechaDesde=", fechaDesde.ToString(), "&fechaHasta=", fechaHasta.ToString()));

            return result;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_RevisionMMPPCoccion>>> ObtenerRevisionMMPPCoccion(DateTime fechaDesde, DateTime fechaHasta)
        {
            var result = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_RevisionMMPPCoccion>>>(string.Concat(_urlControlGestionFab, "RevisionMMPPCoccion?fechaDesde=", fechaDesde.ToString(), "&fechaHasta=", fechaHasta.ToString()));

            return result;
        }

        public async Task<List<DTO_DatosCoccion>> ObtenerDatosCoccion(DateTime fechaDesde, DateTime fechaHasta)
        {
            var result = await _api.GetPostsAsync<List<DTO_DatosCoccion>>(string.Concat(_urlControlGestionFab, "DatosCoccion?fechaDesde=", fechaDesde.ToString(), "&fechaHasta=", fechaHasta.ToString()));

            return result;
        }

        public async Task<List<DTO_HistoricoStocks>> ObtenerHistoricoStocks(DateTime fecha)
        {
            var result = await _api.GetPostsAsync<List<DTO_HistoricoStocks>>(string.Concat(_urlControlGestionFab, "HistoricoStocks?fecha=", fecha.ToString()));

            return result;
        }

        public async Task<List<DTO_CoefCorreccionCoccion>> ObtenerCoeficientesCorreccionCoccion()
        {
            var result = await _api.GetPostsAsync<List<DTO_CoefCorreccionCoccion>>(string.Concat(_urlControlGestionFab, "CoeficientesCorreccionCoccion"));

            return result;
        }

        public async Task<List<DTO_CoefCorreccionHistoricoStocks>> ObtenerCoeficientesCorreccionHistoricoStocks()
        {
            var result = await _api.GetPostsAsync<List<DTO_CoefCorreccionHistoricoStocks>>(string.Concat(_urlControlGestionFab, "CoeficientesCorreccionHistoricoStocks"));

            return result;
        }

        public async Task<bool> AñadirCoeficienteCorreccionCoccion(DTO_CoefCorreccionCoccion dtoCoeficiente)
        {
            var result = await _api.PostPostsAsync<dynamic>(dtoCoeficiente, string.Concat(_urlControlGestionFab, "CoeficienteCorreccionCoccion"));

            return result;
        }

        public async Task<bool> AñadirCoeficienteCorreccionHistoricoStocks(DTO_CoefCorreccionHistoricoStocks dtoCoeficiente)
        {
            var result = await _api.PostPostsAsync<dynamic>(dtoCoeficiente, string.Concat(_urlControlGestionFab, "CoeficienteCorreccionHistoricoStocks"));

            return result;
        }

        public async Task<List<DTO_DatosTCPs>> ObtenerDatosTCPs(DateTime fechaDesde, DateTime fechaHasta)
        {
            var result = await _api.GetPostsAsync<List<DTO_DatosTCPs>>(string.Concat(_urlControlGestionFab, "DatosTCPs?fechaDesde=", fechaDesde.ToString(), "&fechaHasta=", fechaHasta.ToString()));

            return result;
        }

        public async Task<List<DTO_CoefCorreccionTCPs>> ObtenerCoeficientesCorreccionTCPs()
        {
            var result = await _api.GetPostsAsync<List<DTO_CoefCorreccionTCPs>>(string.Concat(_urlControlGestionFab, "CoeficientesCorreccionTCPs"));

            return result;
        }

        public async Task<bool> AñadirCoeficienteCorreccionTCPs(DTO_CoefCorreccionTCPs dtoCoeficiente)
        {
            var result = await _api.PostPostsAsync<dynamic>(dtoCoeficiente, string.Concat(_urlControlGestionFab, "CoeficienteCorreccionTCPs"));

            return result;
        }

        public async Task<List<DTO_ConsumoMMPP_TCPs>> ObtenerConsumosMMPP_TCPs(DateTime fechaDesde, DateTime fechaHasta)
        {
            var result = await _api.GetPostsAsync<List<DTO_ConsumoMMPP_TCPs>>(string.Concat(_urlControlGestionFab, "ConsumosMMPP_TCPs?fechaDesde=", fechaDesde.ToString(), "&fechaHasta=", fechaHasta.ToString()));

            return result;
        }

        #endregion

        #region Facturacion

        public async Task<List<DTO_FacturacionSubproducto>> ObtenerFacturacionSubproductos(DateTime fechaInicio, DateTime fechaFin)
        {

            string uri = string.Concat(_urlControlGestionTra, "facturacionSubproductos?fechaInicio=", fechaInicio.ToUniversalTime().ToString("u"),
                "&fechaFin=", fechaFin.ToUniversalTime().ToString("u"));

            var ret = await _api.GetPostsAsync<List<DTO_FacturacionSubproducto>>(uri);
            return ret;
        }
        
        public async Task<DTO_RespuestaAPI<bool>> EnviarFacturacionSubproductos(List<DTO_FacturacionSubproducto> lista)
        {

            string uri = string.Concat(_urlControlGestionTra, "facturacionSubproductos");

            var ret = await _api.PostPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(lista, uri);

            return ret;
        }
        
        public async Task<List<DTO_FacturacionSubproductosHistorico>> ObtenerFacturacionSubproductosHistorico(int idTransporte)
        {

            string uri = string.Concat(_urlControlGestionTra, "facturacionSubproductosHistorico?idtransporte=", idTransporte.ToString());

            var ret = await _api.GetPostsAsync<List<DTO_FacturacionSubproductosHistorico>>(uri);
            return ret;
        }

        #endregion

        public async Task<DTO_RespuestaAPI<DateTime?>> ComprobarDatosFabJDE(DateTime fecha, int tipoDato)
        {

            string uri = string.Concat(_urlControlGestionFab, "ComprobarDatosFabJDE", $"?fecha={fecha.ToUniversalTime():u}&tipoDato={tipoDato}");

            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<DateTime?>>(uri);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<Dictionary<string, int?>>> ComprobarMaterialesJDE(List<string> materiales)
        {
            string uri = string.Concat(_urlControlGestionFab, "ComprobarMaterialesJDE");

            var ret = await _api.PostPostsAsymmetricAsync<DTO_RespuestaAPI<Dictionary<string, int?>>>(materiales, uri);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> ComprobarCoccionesJDE(List<int> cocciones)
        {
            string uri = string.Concat(_urlControlGestionFab, "ComprobarCoccionesJDE");

            var ret = await _api.PostPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(cocciones, uri);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> EnviarDatosCoccionJDE(List<DTO_DatosCoccion> lista, DateTime fecha, string usuario)
        {

            string uri = string.Concat(_urlControlGestionFab, "DatosCoccion/EnvioJDE", $"?fecha={fecha.ToUniversalTime():u}&usuario={usuario}");

            var ret = await _api.PostPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(lista, uri);

            return ret;
        }

        public async Task<DTO_RespuestaAPI<bool>> EnviarDatosConsumoMMPPCoccionJDE(List<DTO_ConsumoMMPPCoccion> lista, DateTime fecha, string usuario)
        {

            string uri = string.Concat(_urlControlGestionFab, "DatosConsumoMMPPCoccion/EnvioJDE", $"?fecha={fecha.ToUniversalTime():u}&usuario={usuario}");

            var ret = await _api.PostPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(lista, uri);

            return ret;
        }
        

        public async Task<DTO_RespuestaAPI<bool>> EnviarDatosTCPsJDE(List<DTO_HistoricoStocks> lista, DateTime fecha, string usuario)
        {

            string uri = string.Concat(_urlControlGestionFab, "DatosTCPs/EnvioJDE", $"?fecha={fecha.ToUniversalTime():u}&usuario={usuario}");

            var ret = await _api.PostPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(lista, uri);

            return ret;
        }
        
        public async Task<DTO_RespuestaAPI<bool>> EnviarDatosConsumoMMPPTCPsJDE(List<DTO_ConsumoMMPP_TCPs> lista, DateTime fecha, string usuario)
        {

            string uri = string.Concat(_urlControlGestionFab, "DatosConsumoMMPPTCPs/EnvioJDE", $"?fecha={fecha.ToUniversalTime():u}&usuario={usuario}");

            var ret = await _api.PostPostsAsymmetricAsync<DTO_RespuestaAPI<bool>>(lista, uri);

            return ret;
        }

        #region Ajuste Stock JDE

        public async Task<List<DTO_ConfiguracionMaterialesAjusteStockJDE>> ObtenerConfiguracionMaterialesAjusteStockJDE()
        {
            var ret = await _api.GetPostsAsync<List<DTO_ConfiguracionMaterialesAjusteStockJDE>>(string.Concat(_urlControlGestionFab, "ConfiguracionMaterialesAjusteStockJDE"));
            return ret;
        }

        public async Task<string> InsertarMaterialAjusteStockJDE(DTO_ConfiguracionMaterialesAjusteStockJDE datos)
        {
            var ret = await _api.PostPostsAsync<dynamic>(datos, string.Concat(_urlControlGestionFab, "MaterialAjusteStockJDE"));

            return ret;
        }

        public async Task<string> ActualizarMaterialAjusteStockJDE(DTO_ConfiguracionMaterialesAjusteStockJDE datos)
        {
            var ret = await _api.PutPostsAsync<dynamic>(string.Concat(_urlControlGestionFab, "MaterialAjusteStockJDE"), datos);

            return ret;
        }

        public async Task<bool> EliminarMaterialAjusteStockJDE(int idConfig)
        {
            var result = await _api.DeletePostsAsync<bool>(string.Concat(_urlControlGestionFab + "MaterialAjusteStockJDE", "?idConfig=", idConfig));

            return result;
        }

        public async Task<List<DTO_AjusteStock>> ObtenerAjusteStock()
        {
            var ret = await _api.GetPostsAsync<List<DTO_AjusteStock>>(string.Concat(_urlControlGestionFab, "AjusteStock"));
            return ret;
        }

        public async Task<bool> ActualizarStocksMESJDE()
        {
            var ret = await _api.GetPostsAsync<bool>(string.Concat(_urlControlGestionFab, "ActualizarStocksMESJDE"));
            return ret;
        }
        
        #endregion
    }
}