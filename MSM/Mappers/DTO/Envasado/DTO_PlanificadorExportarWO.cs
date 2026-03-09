using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public enum EXPORTAR_WO_ACCION
    {
        CREAR = 0,
        ACTUALIZAR = 1,
        ELIMINAR = 2,
        NADA = 3
    }

    public class DTO_PlanificadorExportarWO
    {
        public int IdWOSecuenciadasMES { get; set; }
        public string IdMES { get; set; }
        public double Cantidad { get; set; }
        public string UOM { get; set; }
        public string IdLinea { get; set; }
        public DateTime FechaInicioPlanificada { get; set; }
        public DateTime FechaFinPlanificada { get; set; }
        public DateTime FechaEntrega { get; set; }
        public string IdProducto { get; set; }
        public string Descripcion { get; set; }
        public string CodigoOriginal { get; set; }
        public string Estado { get; set; }
        public EXPORTAR_WO_ACCION Accion { get; set; }        
    }
}