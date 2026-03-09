using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Ubicaciones
{
    public class ZonaDto
    {
        public int IdZona { get; set; }
        public string Descripcion { get; set; }
        public int IdTipoZona { get; set; }
        public string DescripcionTipoZona { get; set; }
        public int IdAlmacen { get; set; }
        public string DescripcionAlmacen  {get;set;}
    }
}
