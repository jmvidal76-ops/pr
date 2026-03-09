using System;

namespace Common.Models.Fabricacion.Orden
{
    public class DTO_Orden_Detalle
    {
        public int PK { get; set; }
        public string ID { get; set; }
        public string Descripcion { get; set; }
        public object EstadoActual { get; set; }
        public object Material { get; set; }
        public DateTime? FecInicio { get; set; }
        public DateTime? FecFin { get; set; }
        public DateTime? FecIniLocal { get; set; }
        public DateTime? FecFinLocal { get; set; }
        public DateTime? FecInicioEstimado { get; set; }
        public DateTime? FecFinEstimado { get; set; }
        public object TipoOrden { get; set; }
        public string Equipo { get; set; }
        public string LoteMES { get; set; }
        public string LoteLevadura { get; set; }
        public decimal Cantidad { get; set; }
        public string CantidadProducida { get; set; }
        public string MaterialSobrante { get; set; }
        public string Eficiencia { get; set; }
        public int? NumeroDv { get; set; }
        public string ColorMultivalor { get; set; }
        public string PcteTierras { get; set; }
        public string PctePresion { get; set; }
        public string CO2 { get; set; }
        public string CzaBarril { get; set; }
        public string OEEWO { get; set; }
    }
}
