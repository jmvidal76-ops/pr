using System;

namespace Common.Models.Almacen.DTO_MaestroEAN
{
    public class DTO_MaestroEAN
    {
        public int IdMaestroEAN { get; set; }

        public string EAN { get; set; }

        public string IdMaterial { get; set; }

        public string Nombre { get; set; }

        public int IdProveedor { get; set; }

        public string Proveedor { get; set; }

        public DateTime FechaCreado { get; set; }

        public DateTime Fecha { get; set; }

        public string Tipo { get; set; }

        public int IdOrigen { get; set; }
        public string Origen { get; set; }

        public double? Cantidad { get; set; }

        public string UoM { get; set; }
    }
}
