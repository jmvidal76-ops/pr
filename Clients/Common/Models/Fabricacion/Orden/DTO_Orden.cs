using System;

namespace MSM.Models.Fabricacion
{
    public class DTO_Orden
    {
        public int IdWO { get; set; }
        public string CodWO { get; set; }
        public string LoteMES { get; set; }
        public DateTime? FechaInicioPlan { get; set; }
        public DateTime? FechaFinPlan { get; set; }
        public DateTime? FechaInicioReal { get; set; }
        public DateTime? FechaFinReal { get; set; }
        public decimal CantidadReal { get; set; }
        public string NotasWO { get; set; }
        public int IdUbicacion { get; set; }
        public string NombreUbicacion { get; set; }
        public string DescUbicacion { get; set; }
        public int IdTipoWO { get; set; }
        public string DescTipoWO { get; set; }
        public int IdEstadoWO { get; set; }
        public string DescEstadoWO { get; set; }
        public string ColorEstadoWO { get; set; }
        public int IdEstadoLIMS { get; set; }
        public string DescEstadoLIMS { get; set; }
        public string ColorEstadoLIMS { get; set; }
        public string IdMaterial { get; set; }
        public string DescMaterial { get; set; }
        public string UdMedida { get; set; }
        public int IdEstadoKOP { get; set; }
        public string ColorEstadoKOP { get; set; }
        public string DescEstadoKOP { get; set; }
        public Boolean Recalcular { get; set; }
        public int NOrigen { get; set; }
        public int Anio { get; set; }
        public string NombreZona { get; set; }
        public string CzaBarril { get; set; }

    }
}