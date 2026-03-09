using System;

namespace Common.Models.Transportes
{
    public class ProveedorEANDto
    {
        public int IdProveedor { get; set; }

        public string Nombre { get; set; }

        public int IdOrigen { get; set; }

        public DateTime Creado { get; set; }
    }
}
