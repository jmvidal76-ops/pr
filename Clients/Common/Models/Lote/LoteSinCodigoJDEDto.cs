using System;

namespace Common.Models.Lote
{
    public class LoteSinCodigoJDEDto
    {
        public int IdLoteSinCodigoJDE { get; set; }
        public string IdLoteMES { get; set; }
        public string EAN { get; set; }
        public string SSCC { get; set; }
        public string Proveedor { get; set; }
        public string NombreProveedor { get; set; }
        public string Material { get; set; }
        public string NombreMaterial { get; set; }
        public Nullable<decimal> Cantidad { get; set; }
        public string Unidad { get; set; }
        public Nullable<int> IdUbicacionDestino { get; set; }
        public string NombreUbicacion { get; set; }
        public Nullable<System.DateTime> Creado { get; set; }
        public string CreadoPor { get; set; }
        public Nullable<System.DateTime> Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
        public Nullable<int> OffsetConsumoMin { get; set; }
        public string LoteProveedor { get; set; }
    }
}
