using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    /// <summary>
    /// Estructura de datos que almacena la información resumen de un turno
    /// </summary>
    public class ResumenTurno
    {
        public int totalParosNojustificados { get; set; }
        public long milisegundosParosNojustificados { get; set; }
        
        public int totalPerdidasNojustificadas { get; set; }
        public long milisegundosPerdidasNojustificadas { get; set; }
        public ResumenTurno ultimaHoraTurnoAnterior { get; set; }

        public string tiempoParosNojustificados { 
            get { 
                DateTime dateRef = DateTime.MinValue ;
                return dateRef.AddSeconds(milisegundosParosNojustificados).ToString("HH:mm:ss");
            } 
        }
        
        public string tiempoPerdidasNojustificadas
        {
            get
            {
                DateTime dateRef = DateTime.MinValue;
                return dateRef.AddSeconds(milisegundosPerdidasNojustificadas).ToString("HH:mm:ss");
            }
        }
    }
}