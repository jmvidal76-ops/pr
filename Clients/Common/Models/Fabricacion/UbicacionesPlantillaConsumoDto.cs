using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Material
{
    public class UbicacionesPlantillaConsumoDto
    {
        public int IdPlantillaConsumo { get; set; }
        public int IdUbicacion { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
    }
}
