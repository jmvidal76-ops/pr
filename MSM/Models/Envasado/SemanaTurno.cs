using MSM.Controllers;
using MSM.Controllers.Planta;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Xml;
using System.Xml.Serialization;

namespace MSM.Models.Envasado
{
    public class SemanaTurno
    {

        //Atributos
        private Linea _linea;
        private int _year;
        private int _numSemana;
        private DateTime _primerDiaSemana;
        private DateTime _inicioSemana;
        private DateTime _finSemana;
        private string _strTurnos;

        private string _plantillaTurno;

        private List<PlantillaTurno> _diasSemana;

        //Constructor
        public SemanaTurno()
        {

        }

        public SemanaTurno(ref Linea pLinea, int pYear, DateTime pFecha, DateTime pInicio, DateTime pFin, int NumSemana, string pTurnos, string plantillaTurno)
        {
            _linea = pLinea;
            _year = pYear;
            _primerDiaSemana = pFecha;
            _inicioSemana = pInicio;
            _finSemana = pFin;
            _numSemana = NumSemana;
            _plantillaTurno = plantillaTurno;
            _strTurnos = pTurnos;

            if (!String.IsNullOrEmpty(pTurnos))
            {
                PlantillaDiaTurno turnosDia = new PlantillaDiaTurno();
                //XmlSerializer serializer = new XmlSerializer(typeof(PlantillaDiaTurno));
                XmlSerializer serializer = XmlSerializer.FromTypes(new[] { typeof(PlantillaDiaTurno) })[0];
                StringReader reader = new StringReader(_strTurnos);
                turnosDia = (PlantillaDiaTurno)serializer.Deserialize(reader);
                //turnosDia.turnos.All(t => {
                //    t.BreakTurno = t.BreakTurno.Any(b => b.inicio.Equals(DateTime.MinValue)) ? null : t.BreakTurno;
                //    return true;
                //});
                _diasSemana = turnosDia.turnos.ToList();

                PlantillaPeriodoTurno templateTurno = null;
                if (!string.IsNullOrEmpty(plantillaTurno))
                {
                    templateTurno = new PlantillaPeriodoTurno();
                    serializer = XmlSerializer.FromTypes(new[] { typeof(PlantillaPeriodoTurno) })[0];
                    reader = new StringReader(_plantillaTurno);
                    templateTurno = (PlantillaPeriodoTurno)serializer.Deserialize(reader);
                }

                if (templateTurno == null)
                {
                    _plantillaTurno = IdiomaController.GetResourceName("PERSONALIZADO");
                }
                else
                {
                    if (_diasSemana.Count() > 0)
                    {
                        //Si el numero de registros del turno de la semana es superior al número de registros de la semana definida en la plantilla es "personalizado"
                        if (DiasSemana.Count().Equals(templateTurno.TurnoDia.Count))
                        {
                            ///Hacemos un join de la plantilla con la semana para verificar que tienen la misma información
                            ///Nota: Los turnos extendidos se guardan con los TipoTurno generales (Mañana, Tarde, Noche) por lo que no coinciden con su plantillas,
                            ///de forma que miramos si vienen con la propiedad type = "TE"
                            IEnumerable<object> list = DiasSemana.Join(templateTurno.TurnoDia, d => new { d.diaSemana, d.horas }, t => new { t.diaSemana, t.horas }, (d, t) => new { d, t }).Where(p => p.d.tipoTurno.Equals(p.t.tipoTurno) || (!string.IsNullOrEmpty(p.t.propTurno) && p.t.propTurno.Equals("TE")));
                            _plantillaTurno = list.Count().Equals(templateTurno.TurnoDia.Count) ? templateTurno.TurnoDia.FirstOrDefault().tipoTurnoPlantilla : IdiomaController.GetResourceName("PERSONALIZADO");
                        }
                        else
                        {
                            _plantillaTurno = IdiomaController.GetResourceName("PERSONALIZADO");
                        }
                    }
                    else
                    {
                        _plantillaTurno = IdiomaController.GetResourceName("PERSONALIZADO");
                    }
                }
            }


        }

        //Propiedades
        public Linea linea
        {
            get { return _linea; }
            set { _linea = value; }
        }

        public int Year
        {
            get { return _year; }
            set { _year = value; }
        }

        public DateTime primerDiaSemana
        {
            get { return _primerDiaSemana; }
            set { _primerDiaSemana = value; }
        }

        public DateTime inicio
        {
            get { return _inicioSemana; }
            set { _inicioSemana = value; }
        }
        public DateTime fin
        {
            get { return _finSemana; }
            set { _finSemana = value; }
        }
        public int numSemana
        {
            get { return _numSemana; }
            set { _numSemana = value; }
        }

        public string plantillaTurno
        {
            get { return _plantillaTurno; }
            set { _plantillaTurno = value; }
        }

        public List<PlantillaTurno> DiasSemana
        {
            get
            {
                return _diasSemana;
            }
        }

    }
}
