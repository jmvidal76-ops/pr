using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Envasado
{
    public interface IDAO_PlanificadorWO
    {
        Task<DTO_PlanificadorConfiguracion> ActualizarConfiguracion(DTO_PlanificadorConfiguracion dto);
        Task<bool> CargarWOPlanificadasJDE(string idPlanta, DateTime fechaIni, DateTime fechaFin);
        Task ExportarWOLauncher(DateTime fechaInicio, DateTime fechaFin, string lineas, int semana, int anio, string userName);
        Task<bool> GenerarInformePlanificacion(int semana, int anio, bool borrador);
        Task<List<DTO_PlanificadorConfiguracion>> ObtenerConfiguracion();
        Task<List<DTO_PlanificadorWOPlanificadasJDE>> ObtenerWOPlanificadasJDE();
        Task<List<DTO_PlanificadorWOSecuenciadasMES>> ObtenerWOSecuenciadasMES(DateTime fechaIni, DateTime fechaFin, string idLinea);
        Task<bool> CrearWOSecuenciadasMES(List<DTO_PlanificadorWOSecuenciadasMES> wo);
        Task<bool> ActualizarWOSecuenciadasMES(List<DTO_PlanificadorWOSecuenciadasMES> wo);
        Task<bool> BorrarWOSecuenciadasMES(List<int> ids);
        //Task<bool> BorrarWOSecuenciadaMES(int id);
        Task<bool> ActualizarEstadosWOPlanificadasJDE(dynamic body);
        Task<List<DTO_UltimasProducciones>> ObtenerUltimasProduccionesLineas(DateTime fecha);
        Task<List<DTO_ClaveValorInfo>> ObtenerProductosSIGI();
        Task<DTO_RespuestaAPI<List<DTO_PlanificadorJustificacionCambioPlanificacion>>> ObtenerJustificacionesCambiosPlanificacion(DateTime? fechaDesde, DateTime? fechaHasta);
        Task<DTO_RespuestaAPI<bool>> CrearJustificacionCambioPlanificacion(DTO_PlanificadorJustificacionCambioPlanificacion item);
        Task<DTO_RespuestaAPI<bool>> ActualizarJustificacionCambioPlanificacion(DTO_PlanificadorJustificacionCambioPlanificacion item);
        Task<DTO_RespuestaAPI<bool>> EliminarJustificacionCambioPlanificacion(DTO_PlanificadorJustificacionCambioPlanificacion item);
        Task<bool> ProcesarWOSecuenciadasMES(DateTime fechaIni, DateTime fechaFin);
        bool ComprobarExportacion(bool activarExportacion = false);
    }
}
