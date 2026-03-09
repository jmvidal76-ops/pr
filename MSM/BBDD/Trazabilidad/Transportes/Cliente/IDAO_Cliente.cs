using Common.Models.Transporte;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public interface IDAO_Cliente
    {

        Task<List<ClienteDto>> Get();

        Task<int> Delete(int id);

        Task<ClienteDto> Post(ClienteDto cliente);

        Task<ClienteDto> Put(ClienteDto cliente);
    }
}
