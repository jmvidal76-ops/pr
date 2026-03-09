using Common.Models.Operador;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public interface IDAO_Operador
    {
        Task<List<OperadorDto>> Get();

        Task<List<OperadorDto>> GetWithName(string name);

        Task<int> Delete(int id);

        Task<OperadorDto> Post(OperadorDto operador);

        Task<OperadorDto> Put(OperadorDto operador);
    }
}
