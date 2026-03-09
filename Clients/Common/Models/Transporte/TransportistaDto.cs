using System;
using System.ComponentModel.DataAnnotations;

namespace Common.Models.Transportista
{
    public class TransportistaDto
    {
        
        public int IdTransportista { get; set; }

        [Required(ErrorMessage = "El campo nombre es requerido")]
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
