using Clients.ApiClient.Contracts;
using Common.Models;
using Common.Models.Transportes;
using Common.Models.Transportista;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transportista
{
    public interface IDAO_Transportista
    {

          Task<List<TransportistaDto>> Get();

          Task<List<TransportistaDto>> GetWithName(string name);

          Task<List<TransportistaDto>> GetWithNIF(string nif);

          Task<int> Delete(int id);

          Task<TransportistaDto> Post(TransportistaDto transportista);

          Task<TransportistaDto> Put(TransportistaDto transportista);
    }
}
