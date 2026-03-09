using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.Envasado
{
    public class Mapper_ConsolidadoTurnos
    {
        public static DTO_ConsolidadoTurnos MapperDatosToCrearDTO(DateTime fecha, string linea, int idTipoTurno, DateTime fechaInicio, DateTime fechaFin, int idTurno, float oeeCritico, float oeeObjetivo, int tiempoVaciadoTren)
        {
            var dto = new DTO_ConsolidadoTurnos
            {
                IdTurno = idTurno,
                IdLinea = linea,
                FechaTurno = fecha,
                InicioTurno = fechaInicio,
                FinTurno = fechaFin,
                IdTipoTurno = idTipoTurno,
                OEECritico = oeeCritico,
                OEEObjetivo = oeeObjetivo,
                IC = 1,
                TiempoVaciadoTren = tiempoVaciadoTren
            };

            return dto;
        }

        public static DTO_ConsolidadoTurnos MapperDatosToReplanificarDTO(DateTime fecha, string linea, int idTipoTurno, int idTurno)
        {
            var dto = new DTO_ConsolidadoTurnos
            {
                IdTurno = idTurno,
                IdLinea = linea,
                FechaTurno = fecha,
                IdTipoTurno = idTipoTurno
            };

            return dto;
        }
    }
}