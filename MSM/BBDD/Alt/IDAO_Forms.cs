using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Alt;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Alt
{
    public interface IDAO_Forms
    {
        Task<List<DTO_FormsAnalisis>> ObtenerFormulariosAnalisisDatos(DateTime fechaDesde, DateTime fechaHasta, string pdv, string nombreForm);
        Task<List<DTO_ClaveValor>> ObtenerNombreFormPorPDV(string pdv);
    }
}