using Common.Models.Lote;
using Common.Models.LoteUbicacion;
using Common.Models.Operation;
using Common.Models.Ubicaciones;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Almacen.ColasCamiones
{
    public interface IDAO_ColasCamiones
    {
        Task<List<UbicacionDescargaDto>> Get();

        

        Task<List<LoteUbicacionDto>> GetLotesByIdUbicacion(int idUbicacion);

        Task<bool> Put(LotePositionDto lote);
        
    }
}
