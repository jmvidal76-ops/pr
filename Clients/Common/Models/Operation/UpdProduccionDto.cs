using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Operation
{
    public class UpdProduccionDto
    {
        public List<string> IdProduccion { get; set; }

        public string Motivo { get; set; }

        public string fecha { get; set; }

        public int tipo { get; set; }

    }
}
