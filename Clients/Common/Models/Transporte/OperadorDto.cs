using System;

namespace Common.Models.Operador
{
    public class OperadorDto
    {
        public int IdOperador { get; set; }

        public string Nombre { get; set; }

        public string NIF { get; set; }

        public string Direccion { get; set; }

        public string Poblacion { get; set; }

        public string CodigoPostal { get; set; }

        public string Telefono { get; set; }

        public string Observaciones { get; set; }

        public int IdCombo { get; set; }

        public string CreadoPor { get; set; }

        public string ActualizadoPor { get; set; }

    }
}
