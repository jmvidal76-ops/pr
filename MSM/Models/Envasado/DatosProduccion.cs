using System;
using System.Collections.Generic;
using ReglasMES.DataAnnotation;

namespace MSM.Models.Envasado
{
    public class DatosProduccion
    {
        //Atributos
        private Maquina _maquina;
        private double? _calidad;

        //Constructores

        public DatosProduccion()
        {
        }

        public DatosProduccion(Maquina pMaquina, DateTime pFecInicio, DateTime pFecFin)
        {
            _maquina = pMaquina;
            fecInicio = pFecInicio;
            fecFin = pFecFin;
        }

        //Propiedades
        public string idMaquina { get { return _maquina != null ? _maquina.id : null; } }
        public string nombreMaquina { get { return _maquina != null ? _maquina.nombre : null; } }
        public string claseMaquina { get { return _maquina != null ? _maquina.tipo.nombre : null; } }
        public Maquina maquina { set { _maquina = value; } }

        public DateTime fecInicio { get; set; }
        public DateTime fecFin { get; set; }
        public DateTime fecActual { get; set; }

        public int cantidadProducida { get; set; }
        public int rechazos { get; set; }
        public double hectolitros { get; set; }

        public double velocidadNominal { get; set; }
        public double velocidadRealMedia { get; set; }
        //Indica si los datos se han obtenido de los consolidados de BBDD
        public bool Consolidado { get; set; }

        //Recogidos de base de datos
        public int numParosMayores { get; set; }
        public long tiempoParosMayores { get; set; }
        public int numParosMenores { get; set; }
        public long tiempoParosMenores { get; set; }
        public long tiempoBajaVelocidad { get; set; }

        public int numParosMayoresJ { get; set; }
        public long tiempoParosMayoresJ { get; set; }
        public int numParosMenoresJ { get; set; }
        public long tiempoParosMenoresJ { get; set; }
        public long tiempoBajaVelocidadJ { get; set; }

        //Calculados
        public int numParosMayoresNJ { get { return (numParosMayores - numParosMayoresJ); } }
        public long tiempoParosMayoresNJ { get { return (tiempoParosMayores - tiempoParosMayoresJ); } }
        public int numParosMenoresNJ { get { return (numParosMenores - numParosMenoresJ); } }
        public long tiempoParosMenoresNJ { get { return (tiempoParosMenores - tiempoParosMenoresJ); } }
        public long tiempoBajaVelocidadNJ { get { return (tiempoBajaVelocidad - tiempoBajaVelocidadJ); } }

        public int numTotalParos { get { return (numParosMayores + numParosMenores); } }
        public int numTotalParosJ { get { return (numParosMayoresJ + numParosMenoresJ); } }
        public int numTotalParosNJ { get { return (numParosMayoresNJ + numParosMenoresNJ); } }

        public long tiempoTotalParos { get { return (tiempoParosMayores + tiempoParosMenores + tiempoBajaVelocidad); } }
        public long tiempoTotalParosJ { get { return (tiempoParosMayoresJ + tiempoParosMenoresJ + tiempoBajaVelocidadJ); } }
        public long tiempoTotalParosNJ { get { return (tiempoParosMayoresNJ + tiempoParosMenoresNJ + tiempoBajaVelocidadNJ); } }

        public double tiempoPlanificado { get; set; }
        public double tiempoOperativo { get; set; }
        public double tiempoBruto { get; set; }
        public double tiempoNeto { get; set; }


        // Propiedades

        public double disponibilidad
        {
            get
            {
                if (tiempoPlanificado == 0.0) return 0.0;
                else return (tiempoOperativo / tiempoPlanificado) * 100.0;
            }
        }

        public double eficiencia
        {
            get
            {
                if (tiempoOperativo == 0.0) return 0.0;
                else return (tiempoNeto / tiempoOperativo) * 100.0;
            }
        }

        public double rendimiento
        {
            get
            {
                // 1) Preferimos los teóricos ya calculados para la franja
                double envasesTeoricos = velocidadNominal;

                // 2) Si no hay teóricos en la franja, calculamos un estimado en vivo
                if (envasesTeoricos <= 0)
                {
                    double velNomBase = 0;
                    try
                    {
                        velNomBase = _maquina?.orden?.velocidadNominal ?? 0;
                    }
                    catch { }

                    double seg = tiempoPlanificado;
                    if (seg <= 0)
                    {
                        var fin = (fecFin == DateTime.MinValue ? DateTime.UtcNow : fecFin);
                        seg = Math.Max(0, (fin - fecInicio).TotalSeconds);
                    }

                    if (velNomBase > 0 && seg > 0)
                    {
                        envasesTeoricos = velNomBase * (seg / 3600.0);
                    }
                }

                var envasesReales = envases == 0 ? cantidadProducida : envases;
                return envasesTeoricos > 0 ? (envasesReales / envasesTeoricos) * 100.0 : 0.0;
            }
        }


        public double? CalidadSinPorcentaje
        {
            get
            {
                //if (estadoActual.id == Tipos.EstadosOrden.Iniciando.GetValue() || estadoActual.id == Tipos.EstadosOrden.Finalizando.GetValue() || estadoActual.id == Tipos.EstadosOrden.Producción.GetValue()) return 100.0;
                //else 
                return _calidad;
            }
            set { _calidad = value; }
        }

        public double calidad
        {
            get
            {
                //if (estadoActual.id == Tipos.EstadosOrden.Iniciando.GetValue() || estadoActual.id == Tipos.EstadosOrden.Finalizando.GetValue() || estadoActual.id == Tipos.EstadosOrden.Producción.GetValue()) return 100.0;
                //else 
                return CalidadSinPorcentaje.HasValue ? CalidadSinPorcentaje.Value * 1000 : 1000;
            }
        }

        public double oee
        {
            get
            {
                //return (disponibilidad * eficiencia) / 100.0;
                //var envasesTeoricos = velocidadNominal;
                //var envasesReales = envases == 0 ? cantidadProducida : envases;
                //return envasesTeoricos > 0 ? (envasesReales / envasesTeoricos) * 100 : 0;
                return ((rendimiento / 100) * (calidad / 1000)) * 100;
            }
        }


        //public string strTiempoParosMayores
        //{
        //    get
        //    {
        //        TimeSpan ts = (DateTime.MinValue.AddSeconds(tiempoParosMayores) - DateTime.MinValue);
        //        return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
        //    }
        //}

        //public string strTiempoParosMenores
        //{
        //    get
        //    {
        //        TimeSpan ts = (DateTime.MinValue.AddSeconds(tiempoParosMenores) - DateTime.MinValue);
        //        return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
        //    }
        //}

        //public string strTiempoPerdidas
        //{
        //    get
        //    {
        //        TimeSpan ts = (DateTime.MinValue.AddSeconds(tiempoBajaVelocidad + tiempoParosMenores) - DateTime.MinValue);
        //        return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
        //    }
        //}

        //public string strTiempoPerdidasNoJustificados
        //{
        //    get
        //    {
        //        TimeSpan ts = (DateTime.MinValue.AddSeconds(tiempoBajaVelocidadNJ + tiempoParosMenoresNJ) - DateTime.MinValue);
        //        return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
        //    }
        //}


        //public string strTiempoTotalParos
        //{
        //    get
        //    {
        //        TimeSpan ts = (DateTime.MinValue.AddSeconds(tiempoTotalParos) - DateTime.MinValue);
        //        return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
        //    }
        //}

        //public string strTiempoParosMayoresNoJustificados
        //{
        //    get
        //    {
        //        try
        //        {
        //            TimeSpan ts = (DateTime.MinValue.AddSeconds(tiempoParosMayoresNJ) - DateTime.MinValue);
        //            return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
        //        }
        //        catch (Exception ex)
        //        {
        //            return "";
        //        }

        //    }
        //}

        //public string strTiempoParosMenoresNoJustificados
        //{
        //    get
        //    {
        //        TimeSpan ts = (DateTime.MinValue.AddSeconds(tiempoParosMenoresNJ) - DateTime.MinValue);
        //        return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
        //    }
        //}


        //public string strTiempoTotalParosNoJustificados
        //{
        //    get
        //    {

        //        TimeSpan ts = (DateTime.MinValue.AddSeconds(tiempoTotalParosNJ) - DateTime.MinValue);
        //        return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
        //    }
        //}

        public string strTiempoPlanificado
        {
            get
            {
                TimeSpan ts = (DateTime.MinValue.AddSeconds(tiempoPlanificado < 0 ? 0 : tiempoPlanificado) - DateTime.MinValue);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }

        public string strTiempoOperativo
        {
            get
            {
                TimeSpan ts = (DateTime.MinValue.AddSeconds(tiempoOperativo < 0 ? 0 : tiempoOperativo) - DateTime.MinValue);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }

        public string strTiempoNeto
        {
            get
            {
                TimeSpan ts = (DateTime.MinValue.AddSeconds(tiempoNeto < 0 ? 0 : tiempoNeto) - DateTime.MinValue);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }


        public double velocidadNominalHora
        {
            get
            {
                return ModelHelper.sanitize(Math.Round(velocidadNominal / (fecFin - fecInicio).TotalHours, 2));
            }
        }

        public double velocidadReal
        {
            get
            {
                ////return ModelHelper.sanitize(Math.Round((velocidadReal *3600) / (fecFin - fecInicio).TotalHours, 2));
                //double totalHours = ((fecFin == DateTime.MinValue ? DateTime.Now.ToUniversalTime() : fecFin) - fecInicio).TotalHours;
                //return ModelHelper.sanitize(Math.Round(velocidadReal / (totalHours > 1 ? totalHours : 1), 2));
                return tiempoPlanificado == 0 ? 0 : cantidadProducida / (tiempoPlanificado / 3600);
            }
        }

        public double desviacionVelNominal
        {
            get
            {
                double numerador = this.cantidadProducida - ((tiempoPlanificado > 0 ? this.tiempoBruto / this.tiempoPlanificado : 0) * this.velocidadNominal);

                return tiempoPlanificado == 0 ? 0 : numerador / (tiempoPlanificado / 3600);
            }
        }

        public double fecInicioUTC
        {
            get
            {
                return (fecInicio - new DateTime(1970, 1, 1)).TotalSeconds;
            }
        }

        public double fecFinUTC
        {
            get
            {
                return (fecFin - new DateTime(1970, 1, 1)).TotalSeconds;
            }
        }

        public double fecActualUTC
        {
            get
            {
                return (fecActual - new DateTime(1970, 1, 1)).TotalSeconds;
            }
        }

        public string numMaquina
        {
            get
            {
                if (this.idMaquina != null) return idMaquina.Substring(idMaquina.Length - 2, 2);
                else return "";
            }
        }

        public int cajas { get; set; }

        public int envases { get; set; }

        public int palets { get; set; }
    }
}