using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Envasado
{
    public interface IDAO_Produccion
    {
        Task<List<DTO_ProduccionMaquinas>> ObtenerProduccionMaquinasTurno(int idTurno, int numLinea);
    }
}
