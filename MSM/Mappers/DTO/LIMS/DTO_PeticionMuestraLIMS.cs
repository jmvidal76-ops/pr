using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.LIMS
{
    public class DTO_PeticionMuestraLIMS
    {
        public string IdLoteMES { get; set; }
        public DateTime FechaLoteMES { get; set; }
        public int IdWorkflow { get; set; }
        public string Comentarios { get; set; }
    }
}