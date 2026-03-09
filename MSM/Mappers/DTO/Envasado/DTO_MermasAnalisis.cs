using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_MermasAnalisis
    {
        public string Linea { get; set; }
        public string Semaforo { get; set; }
        public decimal IME { get; set; }
        public decimal PorcentajeTrazadosRespectoLlenados { get; set; }
        public int PaletsDespaletera { get; set; }
        public int EnvasesLlenadora { get; set; }
        public decimal PorcentajeMermaInspectoresVacio { get; set; }
        public decimal PorcentajeMermaLlenadoraEtiquetadora { get; set; }
    }
}