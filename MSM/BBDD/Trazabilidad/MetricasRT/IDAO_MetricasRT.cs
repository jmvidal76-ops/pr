using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.BBDD.Trazabilidad.MetricasRT
{
    public interface IDAO_MetricasRT
    {
        void ActivarMetrica(string metricaId);
        void DesactivarMetrica(string metricaId);
    }
}