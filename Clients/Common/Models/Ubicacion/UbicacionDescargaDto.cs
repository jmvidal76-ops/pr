using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Ubicaciones
{
    public class UbicacionDescargaDto
    {
        public int IdUbicacion { get; set; }
        public string Nombre { get; set; }
        public string Estado { get; set; }
        public string Almacen { get; set; }
        public List<ZonaDto> Zona { get; set; }
        public string TipoUbicacion { get; set; }
        public string TipoMaterial  {get;set;}
        public decimal StockActual { get; set; }
        public string IdUbicacionLinkMes { get; set; }
        public string DescripcionAlmacen { get; set; }
    }
}
