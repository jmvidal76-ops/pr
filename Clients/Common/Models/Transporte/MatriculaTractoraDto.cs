using System;

namespace Common.Models.MatriculaTractora
{
    public class MatriculaTractoraDto
    {
        public int IdMatriculaTractora { get; set; }

        public string MatriculaTractora { get; set; }

        public int? PesoMaximo { get; set; }

        public int? IdProveedor { get; set; }

        public int? IdProducto { get; set; }

        public int? IdOperador { get; set; }

        public string NombreOperador { get; set; }

        public int? IdTransportista { get; set; }

        public string NombreTransportista { get; set; }

        public string NIF { get; set; }

        public int IdCombo { get; set; }

        public string CreadoPor { get; set; }

        public string ActualizadoPor { get; set; }

    }
}
 