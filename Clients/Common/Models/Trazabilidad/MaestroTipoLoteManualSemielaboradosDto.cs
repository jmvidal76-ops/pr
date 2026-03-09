using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Trazabilidad
{
    public class MaestroTipoLoteManualSemielaboradosDto
    {
        public int IdMaestroTipoLoteManualSemielaborados { get; set; }
        public string Descripcion { get; set; }

        public int? IdProcesoLote { get; set; }
        public int? IdUbicacion { get; set; }
        public string IdTipoMaterial { get; set; }
        public string IdClaseMaterial { get; set; }
        public int? IdAlmacen { get; set; }
        public int? IdZona { get; set; }
        public int? IdTipoZona { get; set; }
        public bool EsUbicacionLogica { get; set; }
    }
}
