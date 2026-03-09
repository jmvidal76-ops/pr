using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BreadMES.Envasado.Data.DTO
{
    class Lot_DTO
    {
        public int IdMaterial { get; set; }
        public int Destino { get; set; }
        public decimal Cantidad { get; set; }
        public decimal? CantidadNullable { get; set; }
        public string Lote { get; set; }
        public DateTime Fecha { get; set; }
        public string UoM { get; set; }
        public string Material { get; set; }
        public string Serie { get; set; }
        public string Pk { get; set; }
        public string Location { get; set; }
        public string NewLotId { get; set; }
    }
}
