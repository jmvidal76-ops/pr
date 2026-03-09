using Common.Models.Material;
using Common.Models.Transportes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Albaran
{
    public interface IDAO_Albaran
    {
        Task<AlbaranDto> Get(int idTransporte,int tipo);

        Task<AlbaranDto> Post(AlbaranDto albaran);

        Task<int> Delete(int idAlbaran);
    }
}
