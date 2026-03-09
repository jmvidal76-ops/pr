using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_PlanificadorWOSecuenciadasMES
    {
        public int IdWOSecuenciadasMES { get; set; }
        public int IdEstadosWO { get; set; }
        public string IdMES { get; set; }
        public double Cantidad { get; set; }
        public double CantidadOriginal { get; set; }
        public string UOM { get; set; }
        public string IdLinea { get; set; }
        public string[] LineasProducto { get; set; }
        public DateTime FechaInicioPlanificada { get; set; }
        public DateTime FechaFinPlanificada { get; set; }
        public DateTime FechaEntrega { get; set; }
        public string IdProducto { get; set; }
        public string DescripcionProducto { get; set; }
        public string Descripcion { get; set; }
        public double VelocidadNominal { get; set; }
        public string CodigoOriginal { get; set; }
        public double OEEPlanificacion { get; set; }
        public bool AutoAjuste { get; set; }
        public string TipoPreparacion { get; set; }
        public int TiempoPreparacion { get; set; }
        public DateTime Creado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime? Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
    }
}