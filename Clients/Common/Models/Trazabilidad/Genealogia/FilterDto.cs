using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Trazabilidad.Genealogia
{
    public class FilterDto
    {
        public string IdTipoMaterial { get; set; }
        public string IdClaseMaterial { get; set; }
        public string IdMaterial { get; set; }
        public string FechaInicio { get; set; }
        public string FechaFin { get; set; }
        public int? IdAlmacen { get; set; }
        public int? IdZona { get; set; }
        public int? IdUbicacion { get; set; }
        public string IdLoteMES { get; set; }
        public string IdLoteExpandido { get; set; }
        public string LoteProveedor { get; set; }
        public int? IdProceso { get; set; }
        public bool HaciaProducto { get; set; }
        public int? IdLote { get; set; }
    }
}
