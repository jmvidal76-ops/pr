using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Mermas
{
    public class DTO_ConfExtrDatosMermas
    {
        public int IdMermasConfigExtraccionDatosMermas { get; set; }

        public int Zona { get; set; }
        public string Tipo { get; set; }
        public string CodigoJDE { get; set; }

        public string IdClaseMaterialOrigen { get; set; }
        public string ProcesoOrigen { get; set; }
        public string UbicacionOrigen { get; set; }

        public string IdClaseMaterialDestino { get; set; }
        public string ProcesoDestino { get; set; }
        public string UbicacionDestino { get; set; }

        public int? FormulaCalculoExtracto { get; set; }

        public DateTime? Creado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime? Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
    }

}