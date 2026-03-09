using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Fabricacion
{
    public class PlantillaTiposSemielaboradosDto
    {
        public int IdPlantilla { get; set; }
        public List<string> TiposSemielaborados { get; set; }
    }
}
