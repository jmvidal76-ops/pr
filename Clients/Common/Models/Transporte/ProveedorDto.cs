using System;

namespace Common.Models.Transportes
{
    public class ProveedorDto
    {
        public int IdProveedor { get; set; }

        public string Codigo { get; set; }

        public string Nombre { get; set; }

        public string NIF { get; set; }

        public string Direccion { get; set; }

        public string Poblacion { get; set; }

        public string CodigoPostal { get; set; }

        public string Telefono { get; set; }

        public string Observaciones { get; set; }

        public int IdMaestroOrigen { get; set; }

        public int IdCombo { get; set; }

        public string NombreFull
        {
            get { return string.Format("{0} - ({1})", IdProveedor, Nombre); }
        }

        public string CreadoPor { get; set; }

        public string ActualizadoPor { get; set; }
    }
}
