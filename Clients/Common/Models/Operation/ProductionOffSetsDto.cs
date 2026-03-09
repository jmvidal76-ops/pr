using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Operation
{
    public class ProductionOffSetsDto
    {
        public long IdProduccion { get; set; }
        public int IdUbicacion { get; set; }

        public string NombreUbicacion { get; set; }
        public int VelocidadNominalReferencia { get; set; }
        public double Offset { get; set; }
        public double RendimientoWO { get; set; }

        public int VelocidadNominal { get; set; }

    }
}
