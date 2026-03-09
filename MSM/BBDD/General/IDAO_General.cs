using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.General
{
    public interface IDAO_General
    {
        Task<List<DTO_ColorSemaforo>> ObtenerColoresSemaforo();
        bool EnviarEmailGenerico(DTO_MailGeneric mailInfo, bool esManual = true);
        Task<string> ObtenerValorParametroGeneral(string bbdd, string clave);
    }
}
