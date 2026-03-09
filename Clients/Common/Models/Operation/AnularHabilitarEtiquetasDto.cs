using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Operation
{
    public class AnularHabilitarEtiquetasDto
    {
        public List<long> IdsProduccion { get; set; }
        public bool EsAnular { get; set; }
        public string ActualizadoPor { get; set; }
    }
}
