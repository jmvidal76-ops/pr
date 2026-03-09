using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MSM.Models.Envasado
{
    public class DatosSeguimiento
    {
        private List<DatosProduccion> _datosProduccionHoras;
        private DatosProduccion _datosProduccion;
        private bool _esLLenadora;

        public int produccionReal { get; set; }
        public double hectolitros { get; set; }
        public int rechazos { get; set; }
        public int rechazosClasificadores { get; set; }
        public int rechazosInspectorVacios { get; set; }
        public int rechazosLlenadora { get; set; }
        public int rechazosProductoTerminado { get; set; }

        public DatosSeguimiento(bool llenadora = false)
        {
            _datosProduccionHoras = new List<DatosProduccion>();
            _datosProduccion = new DatosProduccion();
            _esLLenadora = llenadora;
        }

        public DatosProduccion datosProduccionTurno
        {
            get { return _datosProduccion; }
            set { _datosProduccion = value; }
        }        


        public List<DatosProduccion> datosProduccionHoras
        {
            get { return _datosProduccionHoras; }
            set { _datosProduccionHoras = value; }
        }

        public bool EsLLenadora
        {
            get { return _esLLenadora; }
        }

        public int CantidadProducidaTurno
        {
            get
            {
                int cantidad = datosProduccionHoras.Count > 0 ? datosProduccionHoras.Sum(p => p.cantidadProducida) : _datosProduccion.cantidadProducida;

                return cantidad;
            }
        }

        public double HectolitrosTurno
        {
            get
            {
                double cantidad = datosProduccionHoras.Count > 0 ? datosProduccionHoras.Sum(p => p.hectolitros) : _datosProduccion.hectolitros;

                return cantidad;
            }
        }

        public double TiempoPlanificadoTurno
        {
            get
            {
                double tiempoPlanificado =  datosProduccionHoras.Count > 0 ? datosProduccionHoras.Sum(p => p.tiempoPlanificado): _datosProduccion.tiempoPlanificado;

                return tiempoPlanificado;
            }
        }
        public double TiempoOperativoTurno
        {
            get
            {

                double tiempoOperativo = datosProduccionHoras.Count > 0 ? datosProduccionHoras.Sum(p => p.tiempoOperativo) : _datosProduccion.tiempoOperativo;


                return tiempoOperativo;
            }
        }
        public double TiempoBrutoTurno
        {
            get
            {
                double tiempoBruto = datosProduccionHoras.Count > 0 ? datosProduccionHoras.Sum(p => p.tiempoBruto) : _datosProduccion.tiempoBruto;


                return tiempoBruto;
            }
        }
        public double TiempoNetoTurno
        {
            get
            {
                double tiempoNeto = datosProduccionHoras.Count > 0 ? datosProduccionHoras.Sum(p => p.tiempoNeto) : _datosProduccion.tiempoNeto;

                return tiempoNeto;
            }
        }

        public double EficienciaTurno
        {
            get
            {
                return TiempoOperativoTurno == 0.0 ? 0.0 : (TiempoNetoTurno / TiempoOperativoTurno) * 100.0;
            }
        }

        public double DisponibilidadTurno
        {
            get
            {
                return TiempoPlanificadoTurno == 0.0 ? 0.0 : (TiempoOperativoTurno / TiempoPlanificadoTurno) * 100.0;
            }
        }

        public double OeeMaquina
        {
            get
            {
                return (DisponibilidadTurno * EficienciaTurno) / 100.0;
                //if (EsLLenadora)
                //{

                //    return VelocidadNominalTurno > 0 ? (CantidadProducidaTurno / (VelocidadNominalTurno)) * 100.0 : 0;
                //}
                //else
                //{
                //    return (DisponibilidadTurno * EficienciaTurno) / 100.0;
                //}
            }
        }

        public double VelocidadNominalTurno
        {
            get
            {
                double velocidadNominal = datosProduccionHoras.Count > 0 ? datosProduccionHoras.Sum(p => p.velocidadNominal) : _datosProduccion.velocidadNominal;
                return velocidadNominal;
            }
        }

        public double VelocidadRealTurno
        {
            get
            {
                return TiempoPlanificadoTurno == 0 ? 0 : CantidadProducidaTurno / (TiempoPlanificadoTurno / 3600);
            }
        }

        public double RendimientoTurno
        {
            get
            {
                return VelocidadNominalTurno > 0 ? (CantidadProducidaTurno / (VelocidadNominalTurno)) * 100.0 : 0;
            }
        }

        public double desviacionVelNominalTurno
        {
            get
        {
                double numerador = CantidadProducidaTurno - ((TiempoPlanificadoTurno > 0 ? this.TiempoBrutoTurno / this.TiempoPlanificadoTurno : 0) * this.VelocidadNominalTurno);

                return TiempoPlanificadoTurno == 0 ? 0 : numerador / (TiempoPlanificadoTurno / 3600);
            }
        }

        public long TiempoParosMayoresTurno { get; set; }
        //{
        //    get
        //    {
        //        long tiempoParosMayores = datosProduccionHoras.Sum(p => p.tiempoParosMayores);
        //        return tiempoParosMayores;
        //    }
        //}
        public long TiempoParosMenoresTurno { get; set; }
        //{
        //    get
        //    {
        //        long tiempoParosMenores = datosProduccionHoras.Sum(p => p.tiempoParosMenores);
        //        return tiempoParosMenores;
        //    }
        //}
        public long TiempoBajaVelocidadTurno { get; set; }
        //{
        //    get
        //    {
        //        long tiempoBajaVelocidad = datosProduccionHoras.Sum(p => p.tiempoBajaVelocidad);
        //        return tiempoBajaVelocidad;
        //    }
        //}

        public long TiempoParosMayoresJTurno { get; set; }
        //{
        //    get
        //    {
        //        long tiempoParosMayoresJ = datosProduccionHoras.Sum(p => p.tiempoParosMayoresJ);
        //        return tiempoParosMayoresJ;
        //    }
        //}

        public long TiempoParosMenoresJTurno { get; set; }
        //{
        //    get
        //    {
        //        long tiempoParosMenoresJ = datosProduccionHoras.Sum(p => p.tiempoParosMenoresJ);
        //        return tiempoParosMenoresJ;
        //    }
        //}

        public long TiempoBajaVelocidadJTurno { get; set; }
        //{
        //    get
        //    {
        //        long tiempoBajaVelocidadJ = datosProduccionHoras.Sum(p => p.tiempoBajaVelocidadJ);
        //        return tiempoBajaVelocidadJ;
        //    }
        //}

        public long TiempoTotalParosTurno { get { return (TiempoParosMayoresTurno + TiempoParosMenoresTurno + TiempoBajaVelocidadTurno); } }

        public string StrTiempoTotalParosTurno
        {
            get
        {
                TimeSpan ts = (DateTime.MinValue.AddSeconds(TiempoTotalParosTurno) - DateTime.MinValue);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }

        public string StrTiempoParosMayoresTurno
        {
            get
            {
                TimeSpan ts = (DateTime.MinValue.AddSeconds(TiempoParosMayoresTurno) - DateTime.MinValue);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }

        public string StrTiempoPerdidasTurno
        {
            get
            {
                TimeSpan ts = (DateTime.MinValue.AddSeconds(TiempoBajaVelocidadTurno + TiempoParosMenoresTurno) - DateTime.MinValue);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }

        public long TiempoParosMayoresNJTurno { get { return (TiempoParosMayoresTurno - TiempoParosMayoresJTurno); } }

        public long TiempoParosMenoresNJTurno { get { return (TiempoParosMenoresTurno - TiempoParosMenoresJTurno); } }

        public long TiempoBajaVelocidadNJTurno { get { return (TiempoBajaVelocidadTurno - TiempoBajaVelocidadJTurno); } }

        public long TiempoTotalParosNJTurno { get { return (TiempoParosMayoresNJTurno + TiempoParosMenoresNJTurno + TiempoBajaVelocidadNJTurno); } }

        public string StrTiempoTotalParosNoJustificadosTurno
        {
            get
        {

                TimeSpan ts = (DateTime.MinValue.AddSeconds(TiempoTotalParosNJTurno) - DateTime.MinValue);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
            }
        }

        public string StrTiempoParosMayoresNoJustificadosTurno
        {
            get
        {
                try
                {
                    TimeSpan ts = (DateTime.MinValue.AddSeconds(TiempoParosMayoresNJTurno) - DateTime.MinValue);
                    return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
                }
                catch (Exception ex)
                {
                    return "";
                }

            }
        }

        public string StrTiempoPerdidasNoJustificadosTurno
        {
            get
        {
                TimeSpan ts = (DateTime.MinValue.AddSeconds(TiempoBajaVelocidadNJTurno + TiempoParosMenoresNJTurno) - DateTime.MinValue);
                return String.Format("{0:d2}:{1:d2}:{2:d2}", ts.Hours, ts.Minutes, ts.Seconds);
        }
    }

        public int NumParosMayoresTurno { get; set; }

        public int NumParosMenoresTurno { get; set; }

        public int NumParosMayoresJTurno { get; set; }

        public int NumParosMenoresJTurno { get; set; }
    }
}
