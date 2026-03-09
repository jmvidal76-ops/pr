using Common.Models.Almacen.DTO_MaestroEAN;
using Common.Models.Operation;
using MSM.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Almacen.CodigoJDE
{
    public interface IDAO_CodigoJDE
    {
        Task<List<DTO_MaestroEAN>> Get();

        Task<DTO_MaestroEAN> Post(DTO_MaestroEAN dto);

        Task<DTO_MaestroEAN> Put(DTO_MaestroEAN dto);

        Task<DTO_MaestroEAN> Delete(DTO_MaestroEAN dto);

        Task<dynamic> CreateMultiple(IEnumerable<DTO_MaestroEAN> dto);

    }
}
