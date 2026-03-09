using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public interface IDAO_ParosPerdidas
    {
        List<ParoPerdida> ObtenerParos(int idLinea, int idTurno);
        List<ParoPerdidaPPAMaquinas> ObtenerParosPerdidasPPAMaquinas(DateTime desde, DateTime hasta, int idLinea);
        List<ParoPerdida> ObtenerPerdidas(int idLinea, int idTurno);
        DatosProduccion ObtenerResumenParosPerdidas(DatosProduccion prod);
        void ModificarNumeroJustificacionesMaquina(string linea, string codigoMaquina);
        void ModificarNumeroJustificacionesEquipo(string codigoEquipo);
        void ModificarNumeroJustificacionesAveria(int idAveria);
        bool EsMaquinaObligatoriaParo(int idMotivo);
        List<DTO_ParosPerdidas> ObtenerParosSolicitudMantenimiento(int idSolicitud);
        Task<decimal> ObtenerPorcentajeSinJustificar(int idTurno);
        Task<DTO_RespuestaAPI<List<DTO_ParosPerdidasRelevoTurno>>> ObtenerParosPerdidasRelevoTurno(int idTurno, bool porDuracion);

    }
}