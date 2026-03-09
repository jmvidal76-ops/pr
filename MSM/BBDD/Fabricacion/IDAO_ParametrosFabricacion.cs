using Common.Models.Fabricacion.Coccion;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Fabricacion
{
    public interface IDAO_ParametrosFabricacion
    {
        Task<List<ParametrosFabricacionDto>> ObtenerParametrosFabricacionPorTipoOrden(int IdTipoOrden);
        Task<List<MaestroParametrosFabricacionDto>> ObtenerMaestroParametrosFabricacionPorTipoOrden(int IdTipoOrden);
        Task<bool> EliminarParametroFabricacion(int id);
        Task<bool> CrearParametroFabricacion(ParametrosFabricacionDto Parametro);
        Task<bool> ActualizarParametroFabricacion(ParametrosFabricacionDto Parametro);
    }
}