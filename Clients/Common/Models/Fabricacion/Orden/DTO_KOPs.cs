using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Fabricacion.Orden
{
    public class DTO_KOPs
    {
        public int ID_WO { get; set; }
        public string CodWO { get; set; }
        public string LoteMES { get; set; }
        public DateTime? FechaFinReal { get; set; }
        public int IdTipoWO { get; set; }
        public string DescTipoWO { get; set; }
        public bool? Recalcular { get; set; }

        public int IdTipoSubproceso { get; set; }
        public string DescSubProceso { get; set; }

        public int Cod_KOP { get; set; } // Puede ser IdKOP (int)
        public string MaestroCodKOP { get; set; }
        public string Des_KOP { get; set; }
        public string MensajeKOP { get; set; }

        public string Valor_Minimo { get; set; }
        public string Valor_Actual { get; set; }
        public string Valor_Maximo { get; set; }

        public string TipoDatoKOP { get; set; }
        public string UOM_KOP { get; set; }
        public int IdTipoKOP { get; set; }
        public string DescTipoKOP { get; set; }

        public int IdEstadoKOP { get; set; }
        public string DescEstadoKOP { get; set; }
        public string ColorEstadoKOP { get; set; }

        public bool? Editable { get; set; }
        public DateTime? FechaActualizado { get; set; }

        public string ID_KOP { get; set; }
        public int Cod_Orden { get; set; }
        public string ID_Orden { get; set; }
        public string ID_Procedimiento { get; set; }
        public int Cod_Procedimiento { get; set; }
        public string Tipo_KOP { get; set; }
        public int Obligatorio { get; set; }
        public System.DateTime Fecha { get; set; }
        public string TipoKOP { get; set; }
        public Nullable<int> Sequence_Procedimiento { get; set; }
        public System.DateTime FechaUTC { get; set; }
        public Nullable<long> PkActVal { get; set; }
        public int Sequence_KOP { get; set; }
        public string Semaforo { get; set; }
        public string filtroSemaforo { get; set; }
    }
}
