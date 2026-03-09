using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Envasado
{
    public interface IDAO_AccionesCorrectivasTurno
    {
        Task<int> CrearAccionCorrectivaTurno(DTO_AccionesCorrectivasTurno accion);
        Task<int> CrearAccionesCorrectivasTurnoAuto(int idTurno);
        Task<List<DTO_AccionesCorrectivasTurno>> ObtenerAccionCorrectivaTurno(int idTurno);
        Task<List<DTO_AccionesCorrectivasTurno>> ObtenerAccionCorrectivaFiltro(DateTime inicio, DateTime fin, string idLinea);
        Task<bool> BorrarAccionCorrectivaTurno(int idTurno);
        Task<bool> BorrarAccionCorrectiva(int idAccionCorrectiva);
        Task<bool> EditarAccionCorrectivaTurno(DTO_AccionesCorrectivasTurno datos);

        Task<bool> PatchAccionCorrectivaTurno(List<MPatchOperation> datos);
        Task<bool> EditarAccionCorrectivaTurnoPorParo(int idParo);
        Task<List<DTO_AccionCorrectivaEmail>> ObtenerAccionCorrectivaEmails();
    }
}
