using Common.Models.Fabricacion.Coccion;
using Common.Models.Fabricacion.KOPs;
using MSM.Mappers.DTO.Fabricacion;
using MSM.Models.Fabricacion;
using MSM_FabricacionAPI.Models.Mostos.KOPs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Fabricacion
{
    public interface IDAO_KOP
    {
        Task<List<DTO_ZonaKOPs>> ObtenerZonasKOPsPorTipoOrden(int IdTipoOrden);
        Task<List<DTO_MostosCoccion>> ObtenerMostosPorZonaTipo(string IdZona,string IdTipoOrden);
        Task<List<DTO_KOPs_Config>> ObtenerKOPsPorZonaTipo(string IdZona,string IdTipoOrden);
        Task<List<DTO_KOPs_Config>> ObtenerKopsPorZonaTipoIdMaterial(string IdZona, string IdTipoOrden, string IdMaterial);
        Task<List<DTO_KOPs_Config>> ObtenerKOPSMostosPorZonaMostoTipoOrden(string IdZona,string IdMosto,string IdTipoOrden);
        Task<List<DTO_KOPs_Config>> ObtenerKOPSMostosPorZonaMostoTipoOrdenImportarPorMaterial(string IdZona, string IdMosto, string IdTipoOrden);
        Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorDetalleOrden(string IdOrden);
        Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorExpandidoDetalleOrden(string IdOrden, string IdKOP);
        Task<List<KOP_GLOBAL>> ObtenerListadoMaestroKOPsMultivalorPorZonaTipo(string IdZona, string IdTipo);
        Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipo(string IdZona, string IdKOP, string IdTipoSubProceso, string idTipo);
        Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorPorZonaTipoMosto(string IdZona, string IdTipo, string IdMosto);
        Task<List<KOP_GLOBAL>> ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipoMosto(string IdZona, string IdKOP, string IdTipoSubProceso, string idTipo, string IdMosto);
        Task<List<DTO_TiposKOPsMultivalor>> ObtenerListadoTiposKOPsMultivalor();
        Task<bool> ActualizarKopsPorDefecto(DTO_KOPs_Config Datos);
        Task<bool> ActualizarKopsPorMostos(DTO_KOPs_Config Datos);
        Task<bool> ImportarKOPSPorDefectoPorZona(DTO_ImportarKOPs Datos);
        Task<bool> ImportarKOPSMostosPorZonaListaMostos(DTO_ImportarKOPs Datos);
        Task<bool> ImportarKOPSPorMaterial(DTO_ImportarKOPs Datos);
        Task<bool> ValidarNumeroKOPMultivalorSubProceso(int NKOPMultivalor, int IdTipoSubProceso,int TipoKOP);
        Task<bool> ActualizarNumeroKOPTipoKOPMultivalor(dynamic Datos);
        Task<bool> BorradoLogicoKOPMultivalor(dynamic Datos);
        Task<bool> BorradoLogicoKOPMultivalorPosicion(dynamic Datos);
        Task<bool> CrearPosicionKopMultivalor(DTO_KOPs_Config Datos);
        Task<bool> ActualizarPosicionKOPMultivalor(DTO_KOPs_Config Datos); 
        Task<bool> ImportarKOPSMultivalorPorDefectoAMostos(DTO_ImportarKOPs Datos);
        Task<string> ObtenerEstadoKOPDetalleOrden(string IdOrden);
        Task<string> ObtenerEstadoKOPMultivalorDetalleOrden(string IdOrden);
        Task<int> ObtenerMaximoNumeroPosicionSegunMosto(int IdKOPMultivalor, int IdSubProceso, string IdMosto, int IdZona, int IdTipo);
        Task<List<DTO_CodigoKOP>> ObtenerKOPSPorTipoWO(int idTipoWO);
        Task<List<DTO_ConfiguracionCapturaKOPSLIMS>> ObtenerConfiguracionCapturaKOPSLIMS();
        Task<bool> InsertarCapturaKOPSLIMS(DTO_ConfiguracionCapturaKOPSLIMS datos);
        Task<bool> ActualizarCapturaKOPSLIMS(DTO_ConfiguracionCapturaKOPSLIMS datos);
        Task<bool> EliminarCapturaKOPSLIMS(int idConfig);
        Task<string> CrearPlantillasKOPsMaterial(string idMosto, string idZona, int idTipoWO, string tipoKOPs);
    }
}