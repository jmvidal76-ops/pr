using Common.Models.Destinatario;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public interface IDAO_Destinatario
    {
        Task<List<DestinatarioDto>> Get();

        Task<int> Delete(int id);

        Task<DestinatarioDto> Post(DestinatarioDto producto);

        Task<DestinatarioDto> Put(DestinatarioDto producto);
    }
}
