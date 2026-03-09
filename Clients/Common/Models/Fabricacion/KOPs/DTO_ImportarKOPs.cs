using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSM_FabricacionAPI.Models.Mostos.KOPs
{
    public class DTO_ImportarKOPs
    {
        public string ListaKOPs { get; set; }
        public string ListaMostos { get; set; }
        public int IdZonaOrigen { get; set; }
        public int IdZonaDestino { get; set; }
        public string IdMaterialOrigen { get; set; }
    }
}
