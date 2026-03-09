using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Fabricacion.Orden
{
    public class DTO_Orden_Planificada_Parametro
    {
        public int? IdParametro { get; set; }
        public string Descripcion { get; set; }
        public string Valor { get; set; }
        public string Unidad { get; set; }
        public int? IdTipoWO { get; set; }
        public string DescTipoWO { get; set; }
        public string TipoParametro { get; set; }

    }
}
