using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_PlanificadorJustificacionCambioPlanificacion
    {
        public int IdJustificacion { get; set; }
        public int Anio { get; set; }
        public int Semana { get; set; }
        public string Linea { get; set; }
        public List<string> Lineas { get; set; }
        public string IdMotivo { get; set; }
        public string Motivo { get; set; }
        public string DescripcionMotivo { get; set; }
        public string Comentario { get; set; }
        public DateTime FechaCreado { get; set; }
        public string Creado { get; set; }
        public DateTime? FechaActualizado { get; set; }
        public string Actualizado { get; set; }
    }
}