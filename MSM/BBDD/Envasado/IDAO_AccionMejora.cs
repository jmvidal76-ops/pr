using MSM.DTO;
using MSM.Mappers.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Envasado
{
    public interface IDAO_AccionMejora
    {
        Task<List<DTO_OrdenesArranques>> ObtenerAccionMejoraArranquesFiltro(string idLinea, int idTipoTurno, DateTime fechaTurno);
        Task<List<DTO_OrdenesCambios>> ObtenerAccionMejoraCambiosFiltro(string idLinea, int idTipoTurno, DateTime fechaTurno);
    }
}
