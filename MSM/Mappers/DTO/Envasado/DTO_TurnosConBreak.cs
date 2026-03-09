using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_TurnosConBreak
    {
        public int Id { get; set; }
        public string IdLinea { get; set; }
        public DateTime Fecha { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public DateTime? FechaInicioBreak { get; set; }
        public DateTime? FechaFinBreak { get; set; }
        public int IdTipoTurno { get; set; }
        public string TipoTurno { get; set; }
        public double Duracion { get; set; }
    }
}