using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_StockSmile
    {
        public string IdMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public string IdClaseMaterial { get; set; }
        public string IdSubClaseMaterial { get; set; }
        public int IdProveedor { get; set; }
        public string DescripcionProveedor { get; set; }
        public int IdStock { get; set; }
        public int? PaletsDisponibles { get; set; }
        public int? UnidadesDisponibles { get; set; }
        public int? UnidadesSolicitadas { get; set; }
        public string CalculoPalets { get; set; }
        public string EAN { get; set; }
        public string Lote { get; set; }
        public DateTime? Fecha { get; set; }
        public DateTime? Creado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime? Actualizado { get; set; }
        public string ActualizadoPor { get; set; }

    }
}