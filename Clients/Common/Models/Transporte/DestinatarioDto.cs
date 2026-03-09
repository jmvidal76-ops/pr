using System;

namespace Common.Models.Destinatario
{
    public class DestinatarioDto
    {
        public int IdDestinatario { get; set; }

        public string Nombre { get; set; }

        public string NIF { get; set; }

        public string Direccion { get; set; }

        public string Poblacion { get; set; }

        public string Telefono { get; set; }

        public string Observaciones { get; set; }

        public int IdCombo { get; set; }

        public string CreadoPor { get; set; }

        public string ActualizadoPor { get; set; }
    }
}
