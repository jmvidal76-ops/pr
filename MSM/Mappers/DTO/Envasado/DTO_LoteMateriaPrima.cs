using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_LoteMateriaPrima
    {
        public int IdLoteMateriaPrima { get; set; }
        public string IdLoteMES { get; set; }
        public string SSCC { get; set; }
        public string IdMaterial { get; set; }
        public int? IdUbicacion { get; set; }
        public string IdProveedor { get; set; }
        public string LoteProveedor { get; set; }
        public decimal? CantidadInicial { get; set; }
        public decimal? CantidadActual { get; set; }
        public string Unidad { get; set; }
        public int? Prioridad { get; set; }
        public DateTime? FechaEntradaPlanta { get; set; }
        public DateTime? FechaEntradaUbicacion { get; set; }
        public DateTime? FechaInicioConsumo { get; set; }
        public DateTime? FechaFinConsumo { get; set; }
        public DateTime? FechaCaducidad { get; set; }
        public DateTime? FechaCuarentena { get; set; }
        public string MotivoCuarentena { get; set; }
        public DateTime? FechaBloqueo { get; set; }
        public string MotivoBloqueo { get; set; }
        public DateTime? FechaDefectuoso { get; set; }
        public int IdTipoUbicacion { get; set; }
        public int? IdProceso { get; set; }
        public string NombreMaterial { get; set; }
        public string Proveedor { get; set; }
        public string NombreUbicacion { get; set; }
        public string Zona { get; set; }
        public string Proceso { get; set; }
        public int IdEstadoLIMS { get; set; }
        public string CreadoPor { get; set; }
    }
}