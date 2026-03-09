using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Material
{
    public class TipoSemielaboradoPlantillaConsumoDto
    {
        public string Clase { get; set; }
        public string DescClase { get; set; }
        public string IdMaterial { get; set; }
        public string DescMaterial { get; set; }
        public string TipoMaterial { get; set; }
        public int IdPlantillaConsumo { get; set; }
        public decimal? Cantidad { get; set; }

        public int IdPlantillaTipo { get; set; }
    }
}
