using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Fabricacion;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Fabricacion
{
    public interface IDAO_Planificacion
    {
        Task<DTO_RespuestaAPI<dynamic>> ObtenerConexionesTCPsLineas();
        Task<DTO_RespuestaAPI<bool>> ActualizarConexionTCPLinea(DTO_ConexionTCPLinea dto);
        Task<DTO_RespuestaAPI<List<DTO_AyudaPlanificacionConfiguracion>>> ObtenerConfiguracionAyudaFiltracion();
        Task<DTO_RespuestaAPI<bool>> ActualizarValorConfiguracionAyudaFiltracion(DTO_AyudaPlanificacionConfiguracion dto);
        Task<DTO_RespuestaAPI<List<DTO_FiltracionDatosLineas>>> ObtenerFiltracionDatosLineas();
        Task<DTO_RespuestaAPI<bool>> ActualizarMermaFiltracion(dynamic datos);
        Task<DTO_RespuestaAPI<List<DTO_FiltracionDatosTotales>>> ObtenerFiltracionDatosTotales();
        Task<DTO_RespuestaAPI<bool>> ActualizarFiltracionCalculoPrevision();
        Task<DTO_RespuestaAPI<bool>> ActualizarMermaEnvasadoCoccion(dynamic datos);
        Task<DTO_RespuestaAPI<bool>> ActualizarMermaFiltracionCoccion(dynamic datos);
        Task<DTO_RespuestaAPI<bool>> ActualizarMermaFermGuardaCoccion(dynamic datos);
        Task<DTO_RespuestaAPI<bool>> ActualizarCoefAumentoVolumenCoccion(dynamic datos);
        Task<DTO_RespuestaAPI<List<DTO_AyudaPlanificacionConfiguracion>>> ObtenerConfiguracionAyudaCoccion();
        Task<DTO_RespuestaAPI<bool>> ActualizarValorConfiguracionAyudaCoccion(DTO_AyudaPlanificacionConfiguracion dto);
        Task<DTO_RespuestaAPI<List<DTO_CoccionCervEnvasarCervAltaDensidad>>> ObtenerCoccionCervEnvasarCervAltaDensidad();
        Task<DTO_RespuestaAPI<List<DTO_CoccionCervAltaDensidadMostoFrio>>> ObtenerCoccionCervAltaDensidadMostoFrio();
        Task<DTO_RespuestaAPI<List<DTO_CoccionMostoFrio>>> ObtenerCoccionMostoFrio();
        Task<DTO_RespuestaAPI<string>> ObtenerValorConfiguracionAyudaCoccion();
        Task<DTO_RespuestaAPI<bool>> ActualizarCoccionCalculoPrevision(int numSemanas);
        Task<DTO_RespuestaAPI<bool>> ComprobarFinFiltracionCalculoPrevision();
    }
}