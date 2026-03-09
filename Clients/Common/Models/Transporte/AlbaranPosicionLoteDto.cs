using Common.Models.Material;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Transportes
{
   public class AlbaranPosicionLoteDto
    {
        public int IdAlbaran { get; set; }
        public int IdLote { get; set; }
        public string LoteMES { get; set; }
        public int IdTipoLote { get; set; }
    }
}
