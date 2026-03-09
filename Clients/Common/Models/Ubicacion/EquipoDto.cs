using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Ubicaciones
{
    public class EquipoDto
    {
        public int PK_Equipo { get; set; }
        public string ID_Equipo { get; set; }
        public int Tipo_Equipo { get; set; }
        public string Nombre_Equipo { get; set; }
        public string Common_Private { get; set; }
        public int PK_Padre { get; set; }
        public string Path { get; set; }
        public string Descripcion { get; set; }
    }
}
