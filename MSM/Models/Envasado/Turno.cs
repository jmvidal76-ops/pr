using System;
using System.Collections.Generic;
using System.Linq;

namespace MSM.Models.Envasado
{
    public class Turno
    {
        private int _idTurno;

        //Atributos
        private Linea _linea;
        private DateTime _fecha;
        private DateTime _inicio;
        private DateTime _fin;

        private TipoTurno _tipo;

        private bool _turnoProductivo;
        private DatosProduccion _produccion;

        //Datos consolidados

        private double _OEE = -1.0;
        private double _disponibilidad = -1.0;
        private double _eficiencia = -1.0;
        private double _calidad;
        private int _envasesRechazados;
        private int _envasesLlenadora;
        private int _envasesPaletizadora;

        //Constructor
        public Turno()
        { }

        public Turno(int pIdTurno, ref Linea pLinea, DateTime pFecha, DateTime pInicio, DateTime pFin, TipoTurno pTipo, bool pTurnoProductivo)
        {
            _idTurno = pIdTurno;
            _linea = pLinea;
            _fecha = pFecha;
            _inicio = pInicio;
            _fin = pFin;
            _tipo = pTipo;
            _turnoProductivo = pTurnoProductivo;
        }

        public Turno(int pIdTurno, DateTime pFecha, DateTime pInicio, DateTime pFin, TipoTurno pTipo, bool pTurnoProductivo)
        {
            _idTurno = pIdTurno;
            _fecha = pFecha;
            _inicio = pInicio;
            _fin = pFin;
            _tipo = pTipo;
            _turnoProductivo = pTurnoProductivo;
        }

        public Turno(int pIdTurno, ref Linea pLinea, DateTime pFecha, DateTime pInicio, DateTime pFin, TipoTurno pTipo, DatosProduccion pProduccion, bool pTurnoProductivo) //double pDisponibilidad, double pEficiencia, double pOEE, int pPales, int pCajas, int pEnvases)
        {
            _idTurno = pIdTurno;
            _linea = pLinea;
            _fecha = pFecha;
            _inicio = pInicio;
            _fin = pFin;
            _tipo = pTipo;
            _produccion = pProduccion;
            _turnoProductivo = pTurnoProductivo;
        }

        //Constructor para datos consolidados
        public Turno(int pIdTurno, DateTime pFecha, TipoTurno pTipo, double pOEE, double pDisponibilidad, double pEficiencia, double pCalidad, int pEnvasesLlenadora, int pEnvasesPaletizadora, int pEnvasesRechazados)
        {
            _idTurno = pIdTurno;
            _fecha = pFecha;
            _tipo = pTipo;
            _OEE = pOEE;
            _disponibilidad = pDisponibilidad;
            _eficiencia = pEficiencia;
            _calidad = pCalidad;
            _envasesLlenadora = pEnvasesLlenadora;
            _envasesPaletizadora = pEnvasesPaletizadora;
            _envasesRechazados = pEnvasesRechazados;
        }

        public int idTurno
        {
            get { return _idTurno; }
            set { _idTurno = value; }
        }

        public Linea linea
        {
            get { return _linea; }
            set { _linea = value; }
        }

        public DateTime fecha
        {
            get { return _fecha; }
            set { _fecha = value; }
        }

        public bool turnoProductivo
        {
            get { return _turnoProductivo; }
            set { _turnoProductivo = value; }
        }


        public Double fechaUTC
        {
            get { return (_fecha - new DateTime(1970, 1, 1)).TotalSeconds; }

        }

        public DateTime inicio
        {
            get { return _inicio; }
            set { _inicio = value; }
        }

        public DateTime fin
        {
            get { return _fin; }
            set { _fin = value; }
        }

        public DateTime inicioLocal
        {
            get { return _inicio.ToLocalTime(); }
        }

        public DateTime finLocal
        {
            get { return _fin.ToLocalTime(); }
        }

        public Double inicioUTC
        {
            get { return (_inicio - new DateTime(1970, 1, 1)).TotalSeconds; }
        }

        public Double finUTC
        {
            get { return (_fin - new DateTime(1970, 1, 1)).TotalSeconds; }
        }

        public TipoTurno tipo
        {
            get { return _tipo; }
            set { _tipo = value; }
        }

        public DatosProduccion produccion
        {
            get { return _produccion; }
            set { _produccion = value; }
        }

        public double calidad
        {
            get { return _calidad; }
            set { _calidad = value; }
        }

        public int envasesLlenadora
        {
            get { return _envasesLlenadora; }
            set { _envasesLlenadora = value; }
        }

        public int envasesPaletizadora
        {
            get { return _envasesPaletizadora; }
            set { _envasesPaletizadora = value; }
        }

        public int envasesRechazados
        {
            get { return _envasesRechazados; }
            set { _envasesRechazados = value; }
        }

        public double tPlanificado
        {
            get
            {
                try
                {
                    double tPlanificado = 0.0;
                    if (this.linea != null)
                    {
                        foreach (Maquina llenadora in this.linea.llenadoras)
                        {
                            /* BUG_2867
                            tPlanificado += llenadora.datosSeguimiento.datosProduccionAvanceTurno.tiempoPlanificado;
                             */
                            foreach (DatosProduccion prod in llenadora.datosSeguimiento.datosProduccionHoras)
                            {
                                tPlanificado += prod.tiempoPlanificado;
                            }
                        }
                    }
                    return tPlanificado;
                }
                catch
                {
                    return 0.0;
                }
            }
        }

        public double tOperativo
        {
            get
            {
                try
                {
                    double tOperativo = 0.0;
                    if (this.linea != null)
                    {
                        foreach (Maquina llenadora in this.linea.llenadoras)
                        {
                            /* BUG_2867
                            tOperativo += llenadora.datosSeguimiento.datosProduccionAvanceTurno.tiempoOperativo;
                             */
                            foreach (DatosProduccion prod in llenadora.datosSeguimiento.datosProduccionHoras)
                            {
                                tOperativo += prod.tiempoOperativo;
                            }
                        }
                    }
                    return tOperativo;
                }
                catch
                {
                    return 0.0;
                }
            }
        }

        public double tNeto
        {
            get
            {
                try
                {
                    double tNeto = 0.0;
                    if (this.linea != null)
                    {
                        foreach (Maquina llenadora in this.linea.llenadoras)
                        {
                            /* BUG_2867
                            tNeto += llenadora.datosSeguimiento.datosProduccionAvanceTurno.tiempoNeto;
                             */
                            foreach (DatosProduccion prod in llenadora.datosSeguimiento.datosProduccionHoras)
                            {
                                tNeto += prod.tiempoNeto;
                            }
                        }
                    }
                    return tNeto;
                }
                catch
                {
                    return 0.0;
                }
            }
        }

        public double tBruto
        {
            get
            {
                try
                {
                    double tBruto = 0.0;
                    if (this.linea != null)
                    {
                        foreach (Maquina llenadora in this.linea.llenadoras)
                        {
                            /* BUG_2867
                            tBruto += llenadora.datosSeguimiento.datosProduccionAvanceTurno.tiempoBruto;
                             */
                            foreach (DatosProduccion prod in llenadora.datosSeguimiento.datosProduccionHoras)
                            {
                                tBruto += prod.tiempoBruto;
                            }
                        }
                    }
                    return tBruto;
                }
                catch
                {
                    return 0.0;
                }
            }
        }

        public double VelocidadNominal
        {
            get
            {
                try
                {
                    double velocidadNominal = 0;
                    if (this.linea != null)
                    {
                        foreach (Maquina llenadora in this.linea.llenadoras)
                        {
                            velocidadNominal += ModelHelper.sanitize(llenadora.datosSeguimiento.datosProduccionHoras.Sum(p => p.velocidadNominal));
                        }
                    }
                    return velocidadNominal;
                }
                catch
                {
                    return 0.0;
                }
            }
        }

        public double OEE
        {
            get
            {
                if (_OEE != -1.0)
                {
                    return _OEE;
                }
                {

                    var envasesTeoricos = VelocidadNominal;
                    return envasesTeoricos > 0 ? (envases / envasesTeoricos) * 100 : 0;
                    //return (disponibilidad * eficiencia) / 100.0;
                }

            }
            set { _OEE = value; }
        }

        public double disponibilidad
        {
            get
            {
                if (_disponibilidad != -1.0)
                {
                    return _disponibilidad;
                }
                {
                    if (tPlanificado != 0.0) return (tOperativo / tPlanificado) * 100.0;
                    else return 0.0;
                }
            }
            set { _disponibilidad = value; }
        }

        public double eficiencia
        {
            get
            {
                if (_eficiencia != -1.0)
                {
                    return _eficiencia;
                }
                {
                    if (tOperativo != 0.0) return (tNeto / tOperativo) * 100.0;
                    else return 0.0;
                }
            }
            set { _eficiencia = value; }
        }

        public int envases
        {
            get
            {
                try
                {
                    int envases = 0;
                    if (this.linea != null)
                    {
                        foreach (Maquina llenadora in this.linea.llenadoras)
                        {
                            /* BUG_2867
                            envases += llenadora.datosSeguimiento.datosProduccionAvanceTurno.envases;
                             */
                            envases += llenadora.datosSeguimiento.CantidadProducidaTurno;
                        }
                    }
                    return envases;
                }
                catch
                {
                    return 0;
                }
            }
        }

        public int palets { get; set; }
        //{
        //    get
        //    {
        //        try
        //        {
        //            int palets = 0;
        //            if (this.linea != null)
        //            {
        //                foreach (Maquina paletera in this.linea.paleteras)
        //                {
        //                    /* BUG_2867
        //                    palets += paletera.datosSeguimiento.datosProduccionAvanceTurno.envases;
        //                     */
        //                    palets += paletera.datosSeguimiento.CantidadProducidaTurno;
        //                }
        //            }
        //            return palets;
        //        }
        //        catch
        //        {
        //            return 0;
        //        }
        //    }
        //}

        public int cajas
        {
            get
            {
                try
                {
                    int cajas = 0;
                    if (this.linea != null)
                    {
                        foreach (Maquina encajonadora in this.linea.encajonadoras)
                        {
                            /* BUG_2867
                            cajas += encajonadora.datosSeguimiento.datosProduccionAvanceTurno.envases;
                             */
                            cajas += encajonadora.datosSeguimiento.CantidadProducidaTurno;
                        }
                    }
                    return cajas;
                }
                catch
                {
                    return 0;
                }
            }
        }

        /* BUG_2867
        public int rechazos
        {
            get
            {
                try
                {
                    int rechazos = 0;
                    if (this.linea != null)
                    {
                        foreach (Maquina m in this.linea.obtenerMaquinas)
                        {
                           
                            rechazos += m.datosSeguimiento.datosProduccionAvanceTurno.rechazos;
                            
                        }
                    }
                    return rechazos;
                }
                catch (Exception e)
                {
                    return 0;
                }
            }
        }
        */
    }
}