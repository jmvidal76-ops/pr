using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Fabricacion
{
    public class PlantillaUbicacionesDto
    {
        public int IdPlantilla { get; set; }
        public List<int> Ubicaciones { get; set; }
    }
}
