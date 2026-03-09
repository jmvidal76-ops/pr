using System;
using System.Collections.Generic;
using ReglasMES.DataAnnotation;

namespace MSM.Models.Envasado
{
    public class DatosContingeciaOrden
    {
        //Constructores

        public DatosContingeciaOrden()
        {
        }
        public string idParticion { get; set; }
        public string idOrden { get; set; }
        public int idTurno { get; set; }
        public int envases { get; set; }
        public int paletsProducidos { get; set; }
        public int paletsEtiquetadoraProducidos { get; set; }
        public int cajas { get; set; }
        public int cantidadPicosCajas { get; set; }
        public int rechazosClasificadorAutomatico { get; set; }
        public int rechazosClasificadorManual { get; set; }
        public int rechazosLlenadoraAutomatico { get; set; }
        public int rechazosLlenadoraManual { get; set; }
        public int rechazosProductoTerminadoAutomatico { get; set; }
        public int rechazosProductoTerminadoManual { get; set; }
        public int rechazosVaciosAutomatico { get; set; }
        public int rechazosVaciosManual { get; set; }
        public DateTime fecInicio { get; set; }
        public DateTime fecFin { get; set; }
        public Single tiempoPaletera { get; set; }
        public int numLinea { get; set; }
        public double tiempoWoActiva { get; set; }
        public DateTime? fecInicioWOActiva { get; set; }
        public DateTime? fecFinWOActiva { get; set; }

        public string fecFinVal
        {
            get
            {
                return this.fecFin.ToLocalTime().ToString();
            }
        }

        public string fecInicioVal
        {
            get
            {
                return this.fecInicio.ToLocalTime().ToString();
            }
        }

        
        public bool ModificadoRechazosClasificadorManual(DatosContingeciaOrden dtProdOld, DatosContingeciaOrden dtProdOldOffset)
        {
            return (this.rechazosClasificadorManual != dtProdOld.rechazosClasificadorManual || this.rechazosClasificadorManual != dtProdOldOffset.rechazosClasificadorManual);
        }
        
        public bool ModificadoRechazosLlenadoraManual(DatosContingeciaOrden dtProdOld, DatosContingeciaOrden dtProdOldOffset)
        {
            return (this.rechazosLlenadoraManual != dtProdOld.rechazosLlenadoraManual || this.rechazosLlenadoraManual != dtProdOldOffset.rechazosLlenadoraManual);
        }
        
        public bool ModificadoRechazosProductoTerminadoManual(DatosContingeciaOrden dtProdOld, DatosContingeciaOrden dtProdOldOffset)
        {
            return (this.rechazosProductoTerminadoManual != dtProdOld.rechazosProductoTerminadoManual || this.rechazosProductoTerminadoManual != dtProdOldOffset.rechazosProductoTerminadoManual);
        }
        
        public bool ModificadoRechazosVaciosManual(DatosContingeciaOrden dtProdOld, DatosContingeciaOrden dtProdOldOffset)
        {
            return (this.rechazosVaciosManual != dtProdOld.rechazosVaciosManual || this.rechazosVaciosManual != dtProdOldOffset.rechazosVaciosManual);
        }

        public int cantidadPicosPalets { get; set; }

        public int cantidadEnvasesNoConformidad { get; set; }

        public int cantidadPaletsNoConformidad { get; set; }
    }
}