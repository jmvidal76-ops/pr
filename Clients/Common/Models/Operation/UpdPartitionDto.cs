using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Operation
{
    public class UpdPartitionDTO
    {
        public List<long> IdProduccion { get; set; }

        public string ParticionWO { get; set; }

        public string ActualizadoPor { get; set; }

    }
}
