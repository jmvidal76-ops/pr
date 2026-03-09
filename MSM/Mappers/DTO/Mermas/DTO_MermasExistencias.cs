
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Mermas
{
    public class DTO_MermasExistencias
    {
        public int IdMermasExistencias { get; set; }
        public DateTime? Fecha { get; set; }
        public int Zona { get; set; }
        public string DescripcionZona { get; set; }
        public string Codigo_JDE { get; set; }
        public string DescripcionMaterial { get; set; }
        public int? IdUbicacion { get; set; }
        public string Ubicacion { get; set; }
        public string DescripcionUbicacion { get; set; }
        public string LoteMES { get; set; }

        public decimal? Extracto { get; set; }
        public decimal? Cantidad { get; set; }
        public bool? Editado { get; set; }
        public bool? Borrado { get; set; }

        public DateTime? Creado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime? Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
    }

}