using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_SolicitudCompletadosSmile
    {
        public int IdSolicitudMisionCompletada { get; set; }
        public long IdSolicitudMision { get; set; }
        public int? UnidadesRepuestas { get; set; }
        public int? UnidadesSolicitadas { get; set; }
        public string SSCC { get; set; }
        public string IdMaterial { get; set; }
        public string EAN { get; set; }
        public string Proveedor { get; set; }
        public string Lote { get; set; }
        public int? Cantidad { get; set; }
        public string EstadoCalidad { get; set; }
        public DateTime? FechaProduccion { get; set; }
        public DateTime? FechaCaducidad { get; set; }
        public DateTime? Creado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime? Actualizado { get; set; }
        public string ActualizadoPor { get; set; }

    }
}