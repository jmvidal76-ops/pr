using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace MSM.BBDD.Envasado
{
    public interface IDAO_MMPPEnvasado
    {
        Task<DTO_RespuestaAPI<List<DTO_SolicitudMMPPEnvasado>>> ObtenerPeticionesMMPPEnvasado(DateTime fechaIni, DateTime fechaFin, string idLinea, CancellationToken ct);
        Task<DTO_RespuestaAPI<List<DTO_SolicitudMMPPEnvasado>>> ObtenerPeticionesMMPPEnvasadoPorParametros(int idSolicitud, string SSCC, string idLinea, string idMaterial);
        Task<DTO_RespuestaAPI<List<DTO_SolicitudCompletadosMMPPEnvasado>>> ObtenerSolicitudCompletadaMMPPEnvasado(int IdSolicitud, CancellationToken ct);
        Task<DTO_RespuestaAPI<bool>> ActualizarEstadoPeticionMMPPEnvasado(int IdSolicitud, int IdEstadoSolicitud, string Usuario, CancellationToken ct);
        Task<DTO_RespuestaAPI<List<DTO_StockEnvasado>>> ObtenerStockMMPPEnvasado(string IdProducto, string IdLinea, string IdMaterial, string IdZona, bool AgruparMMPP, CancellationToken ct);
        Task<DTO_RespuestaAPI<bool>> CrearPeticionMMPPEnvasado(DTO_SolicitudMMPPEnvasado Peticion, CancellationToken ct);
        Task<DTO_RespuestaAPI<bool>> EnviarSolicitudes(CancellationToken ct);
        Task<DTO_RespuestaAPI<bool>> CrearDevolucionesMMPPEnvasado(DTO_SolicitudMMPPEnvasado Peticion);
        Task<DTO_RespuestaAPI<List<DTO_MaestroClasesUbicaciones>>> ObtenerDatos_MaestroClasesUbicaciones(string idLinea, string material, CancellationToken ct);
    }
}
