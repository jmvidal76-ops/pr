using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class DTO_Lot
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
    }
}