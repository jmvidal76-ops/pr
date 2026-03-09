using Common.Models.Transportista;
using System;

namespace Common.Models.Matricula
{
    public class MatriculaDto
    {
        public int IdTransporte { get; set; }

        public string MatriculaTractora { get; set; }

        public string MatriculaRemolque { get; set; }

        public int IdMatriculaTractora { get; set; }

        public int? IdMatriculaRemolque { get; set; }

        public int IdMatriculaTractoraRemolque { get; set; }

        public int IdAlbaran { get; set; }
        public int? IdProveedor { get; set; }
        public int? IdProducto { get; set; }
        public TransportistaDto Transportista { get; set; }
        public int? PesoMaximo { get; set; }

    }
}
 