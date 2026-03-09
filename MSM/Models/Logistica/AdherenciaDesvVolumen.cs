using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Logistica
{
    public class AdherenciaDesvVolumen
    {
        public string SemanaNombre { get; set; }
        public string LineaDescripcion { get; set; }
        public int Id { get; set; }
        public string TipoComparacion { get; set; }
        public int Anio { get; set; }
        public int Semana { get; set; }
        public string Linea { get; set; }
        public System.DateTime FecModif { get; set; }
        public string Formato { get; set; }
        public string ItemMD { get; set; }
        public string Descripcion { get; set; }
        public int CPBPlanificados { get; set; }
        public int CPBReales { get; set; }
        public double HLPlanificados { get; set; }
        public double HLReales { get; set; }
        public string IdMotivo { get; set; }
        public double Desviacion { get; set; }
        public double DesviacionObjetivoPlanPlan { get; set; }
        public double DesviacionObjetivoPlanReal { get; set; }
        public string IdPaleta { get; set; }
        public string Comentario { get; set; }
        public double DesviacionObjetivoPlanIniReal { get; set; }
    }
}