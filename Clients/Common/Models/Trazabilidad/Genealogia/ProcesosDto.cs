using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Trazabilidad.Genealogia
{
    public class ProcesosDto
    {
        public string IdOrden { get; set; }

        public string TipoOrden { get; set; }

        public DateTime? FechaInicio { get; set; }

        public DateTime? FechaFin { get; set; }

        public string Operacion { get; set; }
    }
}
