using Common.Models.Lote;
using Common.Models.Trazabilidad.Fabricacion;
using MSM.Mappers.DTO.Fabricacion.Api;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Fabricacion
{
    public interface IDAO_PropiedadesLotes
    {
        Task<List<PropiedadLoteDto>> ObtenerPropiedadesLotes();

        Task<PropiedadLoteDto> AgregarPropiedadesLotes(PropiedadLoteDto propiedadLote);

        Task<PropiedadLoteDto> ActualizarPropiedadesLotes(PropiedadLoteDto propiedadLote);

        Task<PropiedadLoteDto> EliminarPropiedadesLotes(int id);

        Task<List<AccionPropiedadLoteDto>> ObtenerAccionesPropiedadesLotes();
    }
}
