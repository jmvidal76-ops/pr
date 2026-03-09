using System;

namespace Common.Models.Almacen.Proveedor
{
    public class ProveedorEANDto
    {
        public int IdProveedor { get; set; }
        public string Nombre { get; set; }

        public string IdNombreProveedor { get { return String.Concat(this.IdProveedor, " - ", this.Nombre); } }

        public int IdOrigen { get; set; }

        public DateTime Creado { get; set; }

    }
}
