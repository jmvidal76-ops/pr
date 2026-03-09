using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.Envasado
{
    public class Mapper_ParosPerdidas
    {
        public static DTO_ParosPerdidas Mapper_ParosPerdidas_toDTO(ParosPerdidas origen)
        {
            return new DTO_ParosPerdidas
            {
                Id = origen.Id,
                IdTipoParoPerdida = origen.IdTipoParoPerdida,
                TipoParoPerdida = origen.TipoParoPerdida,
                IdLinea = origen.IdLinea,
                NumeroLineaDescripcion = origen.NumeroLineaDescripcion,
                DescLinea = origen.DescLinea,
                Turno = origen.Turno,
                FechaTurno = origen.FechaTurno,
                IdTipoTurno = origen.IdTipoTurno,
                NombreTipoTurno = origen.NombreTipoTurno,
                InicioLocal = origen.InicioLocal.HasValue ? origen.InicioLocal.Value.AddMilliseconds(-origen.InicioLocal.Value.Millisecond) : origen.InicioLocal,
                FinLocal = origen.FinLocal.HasValue ? origen.FinLocal.Value.AddMilliseconds(-origen.FinLocal.Value.Millisecond) : origen.FinLocal,
                EquipoNombre = origen.EquipoNombre,
                EquipoDescripcion = origen.EquipoDescripcion,
                EquipoConstructivoId = origen.EquipoConstructivoId,
                EquipoConstructivoNombre = string.IsNullOrEmpty(origen.EquipoConstructivoNombre) ? string.Empty : char.ToUpper(origen.EquipoConstructivoNombre[0]) + origen.EquipoConstructivoNombre.Substring(1).ToLower(),
                MaquinaCausaId = origen.MaquinaCausaId,
                MaquinaCausaNombre = string.IsNullOrEmpty(origen.MaquinaCausaNombre) ? string.Empty : char.ToUpper(origen.MaquinaCausaNombre[0]) + origen.MaquinaCausaNombre.Substring(1).ToLower(),
                MotivoNombre = origen.MotivoNombre,
                CausaNombre = origen.CausaNombre,
                Descripcion = string.IsNullOrEmpty(origen.Descripcion) ? string.Empty : char.ToUpper(origen.Descripcion[0]) + origen.Descripcion.Substring(1).ToLower(),
                Observaciones = origen.Observaciones,
                Duracion = TimeSpan.FromSeconds(origen.Duracion).ToString(@"hh\:mm\:ss"),
                DuracionSegundos = origen.Duracion,
                DuracionMenores = origen.DuracionParosMenores,
                DuracionBajaVel = origen.DuracionBajaVelocidad,
                NumeroParoMenores = origen.NumeroParosMenores,
                MotivoID = origen.MotivoId,
                CausaID = origen.CausaId,
                EquipoId = origen.EquipoId,
                Justificado = origen.Justificado
            };
        }

        public static ParoPerdida Mapper_ParoPerdida (ParosPerdidas item, Lineas linea)
        {            
            var result = new ParoPerdida(
                item.Id, 
                (short)item.IdTipoParoPerdida,
                item.TipoParoPerdida,
                Convert.ToBoolean(item.Justificado),
                item.InicioLocal ?? DateTime.MinValue,
                item.FinLocal ?? DateTime.MinValue,
                item.EquipoId,
                item.EquipoDescripcion,
                item.MotivoNombre,
                item.CausaNombre,
                int.Parse(item.MotivoId ?? "0"),
                int.Parse(item.CausaId ?? "0"),
                item.MaquinaCausaId,
                item.MaquinaCausaNombre,
                item.EquipoConstructivoId,
                item.EquipoConstructivoNombre,
                item.Descripcion,
                item.Observaciones);

            result.linea = linea.Id;

            return result;
        }
    }
}