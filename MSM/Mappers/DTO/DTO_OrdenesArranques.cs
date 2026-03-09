using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_OrdenesArranques
    {
        public string Id { get; set; }
        public Nullable<int> Linea { get; set; }
        public Nullable<System.DateTime> InicioReal { get; set; }
        public string TipoTurnoId { get; set; }
        public string TipoTurno { get; set; }
        public Nullable<System.DateTime> FechaTurno { get; set; }
        public string ProductoEntrante { get; set; }
        public int MinutosFinal1 { get; set; }
        public int MinutosFinal2 { get; set; }
        public int MinutosObjetivo1 { get; set; }
        public int MinutosObjetivo2 { get; set; }
        public int TipoArranque { get; set; }
        public string DescripcionLinea { get; set; }
        public string IdLinea { get; set; }
        public string IDProductoEntrante { get; set; }
        public Nullable<long> ID_ARRANQUE { get; set; }
        public string EstadoAct { get; set; }
        public Nullable<System.DateTime> InicioUTC { get; set; }
        public string DESC_ARRANQUE { get; set; }
        public string NumLineaDescripcion { get; set; }
        public string IndicadorLlenadora { get; set; }
        public string IndicadorPaletizadora { get; set; }
        public int TiempoPreactor { get; set; }
    }
}