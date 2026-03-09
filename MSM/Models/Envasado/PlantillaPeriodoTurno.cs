using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace MSM.Models.Envasado
{
    [Serializable()]
    [XmlType("Template")]
    public class PlantillaPeriodoTurno 
    {
        [XmlElement("turno")]
        public List<PlantillaPeriodoTurnoDia> TurnoDia { get; set; }
    }

    [Serializable()]
    [XmlType("turno")]
    public class PlantillaPeriodoTurnoDia
    {
        //Propiedades
        [XmlAttribute("Plantilla")]
        public string tipoTurnoPlantilla {get; set;}

        [XmlAttribute("diaSemana")]
        public int diaSemana { get; set; }

        [XmlAttribute("HorasTurno")]
        public double horas { get; set; }

        [XmlAttribute("IdTipoTurno")]
        public int tipoTurno { get; set; }

        [XmlAttribute("WDTemplate")]
        public string tipoTurnoSemana { get; set; }

        [XmlAttribute("PropTurno")]
        public string propTurno { get; set; }

        [XmlAttribute("TipoTurno")]
        public string tipoTurnoDesc { get; set; }
    }
}
