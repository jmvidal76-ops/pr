using MSM.BBDD.Model;
using MSM.Mappers.DTO.Administracion;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MSM.BBDD.Planta
{
    public interface IDAO_Administracion
    {
        DTO_MailConfiguration MailConfiguration_Read();
        bool MailConfiguration_Update(DTO_MailConfiguration mailConfiguration);        
        MensajeAdministracion ObtenerMensajeAdministracion();
        bool ActualizarMensajeAdministracion(DTO_MensajeAdministracion entity);
        List<DTO_TareasScheduler> TareasScheduler();

    }
}
