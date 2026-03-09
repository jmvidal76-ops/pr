using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO
{
    public class DTO_OrdenesCambios
    {
        public string Id { get; set; }
        public string IdLinea { get; set; }
        public int? Linea { get; set; }
        public string NumLineaDescripcion { get; set; }
        public string DescripcionLinea { get; set; }
        public DateTime? InicioReal { get; set; }
        public DateTime? InicioUTC { get; set; }
        public string TipoTurnoId { get; set; }
        public string TipoTurno { get; set; }
        public DateTime FechaTurno { get; set; }
        public string OrdenSaliente { get; set; }
        public string IDProductoSaliente { get; set; }
        public string ProductoSaliente { get; set; }
        public string OrdenEntrante { get; set; }
        public string IDProductoEntrante { get; set; }
        public string ProductoEntrante { get; set; }
        public int? MinutosFinal1 { get; set; }
        public int? MinutosFinal2 { get; set; }
        public int MinutosObjetivo1 { get; set; }
        public int MinutosObjetivo2 { get; set; }
        public long? ID_CAMBIO { get; set; }
        public string EstadoAct { get; set; }
        public string IndicadorLlenadora { get; set; }
        public string IndicadorPaletizadora { get; set; }
        public int TiempoPreactor { get; set; }
    }
}