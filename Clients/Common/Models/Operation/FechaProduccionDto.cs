using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Operation
{
    public class FechaProduccionDto
    {
        public List<long> IdsProduccion { get; set; }
        public DateTime FechaProduccion { get; set; }
        public string ActualizadoPor { get; set; }
    }
}
