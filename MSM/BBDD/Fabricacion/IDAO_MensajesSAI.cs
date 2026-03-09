using MSM.Mappers.DTO.Fabricacion;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Fabricacion
{
    public interface IDAO_MensajesSAI
    {
        Task<List<DTO_MensajeSAI>> GetMensajesSAI(DateTime fechaInicio, DateTime fechaFin);
        Task<List<DTO_Transferencias>> GetTransferencias(DateTime fechaInicio, DateTime fechaFin);
        Task<List<DTO_AjusteNivel>> GetAjustesNivel(DateTime fechaInicio, DateTime fechaFin);
    }
}
