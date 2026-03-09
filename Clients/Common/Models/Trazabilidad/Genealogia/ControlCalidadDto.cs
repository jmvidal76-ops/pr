using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Trazabilidad.Genealogia
{
    public class ControlCalidadDto
    {
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public DateTime? FechaCreacion { get; set; }
        public string ColorSemaforo { get; set; }
        public string Plantilla { get; set; }
        public int IdAlbaranPosicion { get; set; }
    }
}
