using MSM.BBDD.Model;
using MSM.Controllers.Planta;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Logistica
{
    public class DuotankInfo
    {
        public DuotankZonasCarga ZonaCarga { get; set; }
        public bool CIP { get; set; }
        public bool Detenido { get; set; }
        public bool Llenando { get; set; }
        public decimal PorcentajeLlenado { get; set; }
        public string Matricula { get; set; }
        public bool SinOperacion { get; set; }
        public string TiempoOperacion { get; set; }

        public string Operacion
        {
            get
            {
                if (SinOperacion)
                {
                    return IdiomaController.GetResourceName("SIN_OPERACION");
                }
                else
                {
                    if (Detenido)
                    {
                        return CIP ? IdiomaController.GetResourceName("CIP") + " - " + IdiomaController.GetResourceName("DETENIDO") :
                                IdiomaController.GetResourceName("LLENANDO") + " - " + IdiomaController.GetResourceName("DETENIDO");
                    }
                    else
                    {
                        return CIP ? IdiomaController.GetResourceName("CIP") : IdiomaController.GetResourceName("LLENANDO");
                    }
                }
            }
        }
    }
}