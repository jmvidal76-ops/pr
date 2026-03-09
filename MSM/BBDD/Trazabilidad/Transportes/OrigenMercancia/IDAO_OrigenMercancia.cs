using Common.Models.Transportes;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public interface IDAO_OrigenMercancia
    {
        Task<List<OrigenMercanciaDto>> Get();

        Task<List<OrigenMercanciaDto>> GetWithName(string name);

        Task<int> Delete(int id);

        Task<OrigenMercanciaDto> Post(OrigenMercanciaDto origenMercancia);

        Task<OrigenMercanciaDto> Put(OrigenMercanciaDto origenMercancia);
    }
}
