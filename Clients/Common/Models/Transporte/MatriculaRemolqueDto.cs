using System;

namespace Common.Models.MatriculaRemolque
{
    public class MatriculaRemolqueDto
    {
        public int IdMatriculaRemolque { get; set; }

        public string MatriculaRemolque { get; set; }

        public int? PesoMaximo { get; set; }

        public int IdCombo { get; set; }

        public string CreadoPor { get; set; }

        public string ActualizadoPor { get; set; }
    }
}
