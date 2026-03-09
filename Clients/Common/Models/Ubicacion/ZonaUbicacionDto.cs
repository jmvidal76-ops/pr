using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Ubicaciones
{
    public class ZonaUbicacionDto
    {
        public int IdZona { get; set; }
        public List<int> Ubicaciones { get; set; }
    }
}
