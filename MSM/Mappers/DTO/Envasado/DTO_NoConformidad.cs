using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_NoConformidad
    {
        public long IdNoConformidad { get; set; }
        public long IdProduccion { get; set; }
        public string SSCC { get; set; }
        public short NumeroLinea { get; set; }
        public string Producto { get; set; }
        public string LoteJDE { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaProduccion { get; set; }
        public DateTime FechaNoConformidad { get; set; }
        public string IdOrden { get; set; }
        public string IdParticion { get; set; }
        public long IdTurno { get; set; }
        public bool Activo { get; set; }
        public DateTime Creado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
    }
}