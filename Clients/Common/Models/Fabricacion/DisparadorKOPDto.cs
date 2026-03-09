using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Fabricacion
{
    public class DisparadorKOPDto
    {
        public int IdPlantillaConsumo { get; set; }
        public int IdMaestroKOP { get; set; }
        public string CodKOP { get; set; }
        public string DescKOP { get; set; }
        public Nullable<int> IdZona { get; set; }
        public string NombreZona { get; set; }
        public int IdTipoKOP { get; set; }
    }
}
