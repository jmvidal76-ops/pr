using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Transportes
{
   public class DocumentoDto
    {
       
        public int IdDocumento { get; set; }
        public int IdTransporte { get; set; }
        public int IdTipoDocumento { get; set; }
        public string Descripcion { get; set; }
        public string NombreFichero { get; set; }
        public byte[] Fichero { get; set; }
        public int EditRow { get; set; } 
        public TipoDocumentoDto TipoDocumento { get; set; }
    }
}
