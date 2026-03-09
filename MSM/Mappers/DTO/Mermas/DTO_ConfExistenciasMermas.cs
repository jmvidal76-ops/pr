using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Mermas
{
    public class DTO_ConfExistenciasMermas
    {
        public int IdMermasConfigCalcExistencias { get; set; }
        public int Zona { get; set; }
        public string Ubicacion { get; set; }
        public int? MetodoCalculo { get; set; }

        public DateTime? Creado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime? Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
    }

}