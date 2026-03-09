using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Utilidades
{
    public class TendenciaLineal
    {
        public TendenciaLineal(IList<float> xAxisValues, IList<float> yAxisValues)
            : this(yAxisValues.Select((t, i) => new Tuple<float, float>(xAxisValues[i], t)))
        { }
        public TendenciaLineal(IEnumerable<Tuple<float, float>> data)
        {
            var cachedData = data.ToList();

            var n = cachedData.Count;
            var sumX = cachedData.Sum(x => x.Item1);
            var sumX2 = cachedData.Sum(x => x.Item1 * x.Item1);
            var sumY = cachedData.Sum(x => x.Item2);
            var sumXY = cachedData.Sum(x => x.Item1 * x.Item2);

            var promedioX = sumX / n;
            var promedioY = sumY / n;

            Pendiente = (sumXY - (n * promedioX * promedioY)) / (sumX2 - (n * (promedioX * promedioX)));

            InterseccionY = promedioY - (Pendiente * promedioX);
        }

        public float Pendiente { get; private set; }
        public float InterseccionY { get; private set; }

        public float GetYValue(float xValue)
        {
            return Pendiente * xValue + InterseccionY;
        }
    }
}