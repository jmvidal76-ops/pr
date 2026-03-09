using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class ProcesoWO
    {
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public string LoteSAI { get; set; }
        public string DescSubProceso { get; set; }
        public string totalHoras
        {
            get
            {
                try
                {
                    decimal result = Convert.ToDecimal(
                        (
                            (this.FechaFin.Value.ToLocalTime() - this.FechaInicio.Value.ToLocalTime()).TotalSeconds 
                        ) / 3600);
                    if (result >= 1)
                    {
                        return result.ToString("#.##");
                    }
                    else
                    {
                        return result.ToString("0.##");
                    }
                }
                catch(Exception ex)
                {
                    return "---";
                }
            }
        }

        public int Id { get; set; }
        public int IdWO { get; set; }
    }
}