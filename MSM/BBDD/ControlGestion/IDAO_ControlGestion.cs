using MSM.Mappers.DTO;
using MSM.Mappers.DTO.ControlGestion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.ControlGestion
{
    public interface IDAO_ControlGestion
    {
        Task<List<DTO_ConsumoMMPPCoccion>> ObtenerConsumosMMPPCoccion(DateTime fechaDesde, DateTime fechaHasta);
        Task<DTO_RespuestaAPI<List<DTO_RevisionMMPPCoccion>>> ObtenerRevisionMMPPCoccion(DateTime fechaDesde, DateTime fechaHasta);
        Task<List<DTO_DatosCoccion>> ObtenerDatosCoccion(DateTime fechaDesde, DateTime fechaHasta);
        Task<List<DTO_HistoricoStocks>> ObtenerHistoricoStocks(DateTime fecha);
        Task<List<DTO_CoefCorreccionCoccion>> ObtenerCoeficientesCorreccionCoccion();
        Task<List<DTO_CoefCorreccionHistoricoStocks>> ObtenerCoeficientesCorreccionHistoricoStocks();
        Task<bool> AñadirCoeficienteCorreccionCoccion(DTO_CoefCorreccionCoccion dtoCoeficiente);
        Task<bool> AñadirCoeficienteCorreccionHistoricoStocks(DTO_CoefCorreccionHistoricoStocks dtoCoeficiente);
        Task<List<DTO_DatosTCPs>> ObtenerDatosTCPs(DateTime fechaDesde, DateTime fechaHasta);
        Task<List<DTO_CoefCorreccionTCPs>> ObtenerCoeficientesCorreccionTCPs();
        Task<bool> AñadirCoeficienteCorreccionTCPs(DTO_CoefCorreccionTCPs dtoCoeficiente);
        Task<List<DTO_ConsumoMMPP_TCPs>> ObtenerConsumosMMPP_TCPs(DateTime fechaDesde, DateTime fechaHasta);

        Task<List<DTO_FacturacionSubproducto>> ObtenerFacturacionSubproductos(DateTime fechaInicio, DateTime fechaFin);
        Task<DTO_RespuestaAPI<bool>> EnviarFacturacionSubproductos(List<DTO_FacturacionSubproducto> lista);
        Task<List<DTO_FacturacionSubproductosHistorico>> ObtenerFacturacionSubproductosHistorico(int idTransporte);

        Task<DTO_RespuestaAPI<DateTime?>> ComprobarDatosFabJDE(DateTime fecha, int tipoDato);
        Task<DTO_RespuestaAPI<Dictionary<string, int?>>> ComprobarMaterialesJDE(List<string> materiales);
        Task<DTO_RespuestaAPI<bool>> ComprobarCoccionesJDE(List<int> cocciones);
        Task<DTO_RespuestaAPI<bool>> EnviarDatosCoccionJDE(List<DTO_DatosCoccion> lista, DateTime fecha, string usuario);
        Task<DTO_RespuestaAPI<bool>> EnviarDatosConsumoMMPPCoccionJDE(List<DTO_ConsumoMMPPCoccion> lista, DateTime fecha, string usuario);
        Task<DTO_RespuestaAPI<bool>> EnviarDatosTCPsJDE(List<DTO_HistoricoStocks> lista, DateTime fecha, string usuario);
        Task<DTO_RespuestaAPI<bool>> EnviarDatosConsumoMMPPTCPsJDE(List<DTO_ConsumoMMPP_TCPs> lista, DateTime fecha, string usuario);

        Task<List<DTO_ConfiguracionMaterialesAjusteStockJDE>> ObtenerConfiguracionMaterialesAjusteStockJDE();
        Task<string> InsertarMaterialAjusteStockJDE(DTO_ConfiguracionMaterialesAjusteStockJDE datos);
        Task<string> ActualizarMaterialAjusteStockJDE(DTO_ConfiguracionMaterialesAjusteStockJDE datos);
        Task<bool> EliminarMaterialAjusteStockJDE(int idConfig);
        Task<List<DTO_AjusteStock>> ObtenerAjusteStock();
        Task<bool> ActualizarStocksMESJDE();
    }
}