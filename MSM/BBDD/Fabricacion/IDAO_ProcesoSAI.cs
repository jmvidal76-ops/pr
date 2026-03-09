using MSM.Models.Fabricacion;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Fabricacion
{
    public interface IDAO_ProcesoSAI
    {
        Task<List<msgDeltaV>> ObtenerListadoSubProcesoSAI(string idOrden, string idSubProcesoSAI);
    }
}