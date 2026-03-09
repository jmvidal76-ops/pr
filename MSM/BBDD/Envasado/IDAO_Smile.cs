using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MSM.Mappers.DTO;

namespace MSM.BBDD.Envasado
{
    public interface IDAO_Smile
    {
        Task<DTO_RespuestaAPI<List<DTO_SolicitudSmile>>> ObtenerPeticionesMMPPSmile(DateTime fechaIni, DateTime fechaFin, string idLinea);
        Task<DTO_RespuestaAPI<List<DTO_SolicitudSmile>>> ObtenerPeticionesMMPPSmilePorParametros(int idSolicitud, string SSCC, string idLinea, string idMaterial);
        Task<DTO_RespuestaAPI<List<DTO_SolicitudCompletadosSmile>>> ObtenerSolicitudCompletadaSmile(int IdSolicitud);
        Task<DTO_RespuestaAPI<bool>> ActualizarEstadoPeticionSmile(int IdSolicitud, int IdEstadoSolicitud, string Usuario);
        Task<DTO_RespuestaAPI<List<DTO_StockSmile>>> ObtenerStockMMPPSmile(string IdProducto, string IdLinea, string IdMaterial, string IdZona, bool AgruparMMPP);
        Task<DTO_RespuestaAPI<bool>> CrearPeticionSmile(DTO_SolicitudSmile Peticion);
        Task<DTO_RespuestaAPI<bool>> CrearDevolucionesSmile(DTO_SolicitudSmile Peticion);
        Task<DTO_RespuestaAPI<bool>> EnviarSolicitudes();
        Task<DTO_RespuestaAPI<List<DTO_MaestroClaseSubClaseMMPPUbicacion>>> ObtenerDatosMaestroClaseSubClaseMMPPUbicacion(string idLinea);
        Task<DTO_RespuestaAPI<List<DTO_MaestroClaseSubClaseMMPPUbicacion>>> ObtenerDatosMaestroClaseSubClaseMMPPUbicacion(string idLinea, string material);

    }
}
