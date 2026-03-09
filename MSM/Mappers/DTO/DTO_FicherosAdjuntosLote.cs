using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO
{
    public class DTO_FicherosAdjuntosLote
    {
        public int IdLote { get; set; }
        public int TipoLote { get; set; }
        public List<string> NombreArchivosAdjuntos { get; set; }
        public string User { get; set; }

        public DTO_FicherosAdjuntosLote()
        {
            NombreArchivosAdjuntos = new List<string>();
        }
    }
}