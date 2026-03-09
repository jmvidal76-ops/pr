using Common.Models.Almacen;
using Common.Models.Lote;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Almacen.JDERecepcion
{
    public interface IDAO_JDERecepcion
    {
        Task<List<JDERecepcionMaterialDto>> Get(DateTime fechaInicio, DateTime fechaFin);


        Task<List<JDEPropiedadRecepcionDto>> GetProperties(string codigoRecepcion);

        Task<List<LoteSinCodigoJDEDto>> ObtenerLoteSinCodigoJDE();

        Task ActualizarLoteSinCodigoJDE(LoteSinCodigoJDEDto lote);

        Task<List<long>> GenerarLotesSinCodigoJDE(List<long> dto);
    }
}
