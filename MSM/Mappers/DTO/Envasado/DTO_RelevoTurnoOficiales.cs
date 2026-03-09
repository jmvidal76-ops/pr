using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_RelevoTurnoOficiales
    {
        public int Id { get; set; }
        public long IdConsolidadoTurno { get; set; }
        public string IdLinea { get; set; }
        public string IdZona { get; set; }
        public int IdTurno { get; set; }
        public int IdTipoTurno { get; set; }
        public string Oficial { get; set; }
        public string Notas { get; set; }
        public DateTime FechaTurno { get; set; }
        public DateTime InicioTurno { get; set; }
        public DateTime FinTurno { get; set; }
        public DateTime FechaAlta { get; set; }
        public DateTime FechaMod { get; set; }
    }
}