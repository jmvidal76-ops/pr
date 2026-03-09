using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_DatosProduccionMaquinaSIT
    {
        double _tiempoNeto;
        double _tiempoBruto;
        double _tiempoOperativo;
        double _tiempoPlanificado;
        double _velocidadNominalLlenadora;
        double _velocidadNominalPaletizadora;

        public double TIEMPO_NETO
        {
            get
            {
                if (double.IsInfinity(_tiempoNeto) || double.IsNaN(_tiempoNeto))
                {
                    //Si es un NaN usamos el valor del tBruto -> nos puede falsear paros menores incluso paros mayores
                    return TIEMPO_BRUTO;
                }
                else
                {
                    return _tiempoNeto;
                }
            }
            set
            {
                _tiempoNeto = value;
            }
        }
        public double TIEMPO_BRUTO
        {
            get
            {
                return _tiempoBruto;
            }
            set
            {
                if (double.IsInfinity(value) || double.IsNaN(value))
                {
                    _tiempoBruto = 0;
                }
                else
                {
                    _tiempoBruto = value;
                }

            }
        }
        public double TIEMPO_OPERATIVO
        {
            get
            {
                return _tiempoOperativo;
            }
            set
            {
                if (double.IsInfinity(value) || double.IsNaN(value))
                {
                    _tiempoOperativo = 0;
                }
                else
                {
                    _tiempoOperativo = value;
                }

            }
        }
        public double TIEMPO_PLANIFICADO
        {
            get
            {
                return _tiempoPlanificado;
            }
            set
            {
                if (double.IsInfinity(value) || double.IsNaN(value))
                {
                    _tiempoPlanificado = 0;
                }
                else
                {
                    _tiempoPlanificado = value;
                }

            }
        }

        public double VELOCIDAD_NOMINAL_LLENADORA
        {
            get
            {
                return _velocidadNominalLlenadora;
            }
            set
            {
                if (double.IsInfinity(value) || double.IsNaN(value))
                {
                    _velocidadNominalLlenadora = 0;
                }
                else
                {
                    _velocidadNominalLlenadora = value;
                }

            }
        }

        public double VELOCIDAD_NOMINAL_PALETIZADORA
        {
            get
            {
                return _velocidadNominalPaletizadora;
            }
            set
            {
                if (double.IsInfinity(value) || double.IsNaN(value))
                {
                    _velocidadNominalPaletizadora = 0;
                }
                else
                {
                    _velocidadNominalPaletizadora = value;
                }

            }
        }

        public int CONTADOR_PRODUCCION { get; set; }
        public int CONTADOR_RECHAZOS { get; set; }
    }
}