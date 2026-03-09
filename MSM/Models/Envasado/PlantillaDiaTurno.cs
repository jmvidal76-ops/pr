using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;
using System.Xml.Serialization;

namespace MSM.Models.Envasado
{
    /// <summary>
    /// Usamos DataContract y DataMember ya que si no, no se envian las propiedades
    /// </summary>
    [Serializable, DataContract]
    [System.Xml.Serialization.XmlRoot("ColeccionTurnos")]
    public class PlantillaDiaTurno
    {
        [XmlArray("turnos")]
        [XmlArrayItem("turno", typeof(PlantillaTurno))]
        public PlantillaTurno[] turnos { get; set; }
    }

    [Serializable, DataContract]
    public class PlantillaTurno
    {

        //Atributos
        [DataMember]
        private string _idTurno;
        [DataMember]
        private DateTime _dia;
        [DataMember]
        private DateTime _inicio;
        [DataMember]
        private DateTime _fin;
        [DataMember]
        private DateTime _inicioTurno;
        [DataMember]
        private DateTime _finTurno;
        [DataMember]
        private int _tipoTurno;
        [DataMember]
        private string _tipoTurnoSemana;
        [DataMember]
        private string _tipoDia; // Normal,Holliday, null (personalizado)
        [DataMember]
        private double _horas;
        [DataMember]
        private int _diaSemana;
        [DataMember]
        private string _festivoLaborable; //Y (festivo laborable), N (festivo no laborable), null (no festivo)
        private PlantillaBreak _plantillaBreak;


        //Propiedades
        [XmlAttribute("shc_work_sched_day_pk")]
        [DataMember]
        public string idTurno
        {
            get { return _idTurno; }
            set { _idTurno = value; }
        }

        [XmlAttribute("work_date")]
        [DataMember]
        public DateTime dia
        {
            get { return _dia; }
            set { _dia = value; }
        }

        [XmlAttribute("diaSemana")]
        [DataMember]
        public Int32 diaSemana
        {
            get { return _diaSemana; }
            set { _diaSemana = value; }
        }

        [XmlAttribute("work_start")]
        [DataMember]
        public DateTime inicio
        {
            get { return _inicio.ToLocalTime(); }
            set { _inicio = value; }
        }

        [XmlAttribute("work_end")]
        [DataMember]
        public DateTime fin
        {
            get { return _fin.ToLocalTime(); }
            set { _fin = value; }
        }

        [XmlAttribute("horas")]
        [DataMember]
        public double horas
        {
            get { return _horas; }
            set { _horas = value; }
        }

        [XmlAttribute("shc_working_time_id")]
        [DataMember]
        public int tipoTurno
        {
            get { return _tipoTurno; }
            set { _tipoTurno = value; }
        }

        [XmlAttribute("shc_working_day_id")]
        [DataMember]
        public string tipoTurnoSemana
        {
            get { return _tipoTurnoSemana; }
            set { _tipoTurnoSemana = value; }
        }

        [XmlAttribute("shc_day_type_id")]
        [DataMember]
        public string tipoDia
        {
            get { return _tipoDia; }
            set { _tipoDia = value; }
        }

        [XmlAttribute("holiday_work")]
        [DataMember]
        public string festivoLaborable
        {
            get { return _festivoLaborable; }
            set { _festivoLaborable = value; }
        }

        [XmlAttribute("working_time_start")]
        [DataMember]
        public DateTime inicioTurno
        {
            get { return _inicioTurno; } // Desde BBDD ya le aplicamos el BIAS con el que fue definido
            set { _inicioTurno = value; }
        }

        [XmlAttribute("working_time_end")]
        [DataMember]
        public DateTime finTurno
        {
            get { return _finTurno; }// Desde BBDD ya le aplicamos el BIAS con el que fue definido
            set { _finTurno = value; }
        }

        [XmlElement("workBreak", IsNullable = false)]
        [DataMember]
        public PlantillaBreak BreakTurno
        {
            get
            {
                if (_plantillaBreak != null)
                {
                    PlantillaBreak plantillaBreak = _plantillaBreak.inicio.Equals(DateTime.MinValue.ToLocalTime()) ? null : _plantillaBreak;

                    return plantillaBreak;
                }
                else
                {
                    return null;
                }
            }
            set { _plantillaBreak = value; }
        }

        [DataMember]
        public double horasInicio
        {
            get
            {
                if (inicio.Equals(inicioTurno))
                {
                    if (this.BreakTurno != null)
                    {
                        return (this.BreakTurno.inicio - inicio).TotalHours;
                    }
                    else
                    {
                        return (fin - inicio).TotalHours;
                    }
                }
                else
                {
                    return 0;
                }
            }
        }

        [DataMember]
        public double horasFin
        {
            get
            {
                if (fin.Equals(finTurno))
                {
                    if (!inicio.Equals(inicioTurno))
                    {
                        return (fin - inicio).TotalHours;
                    }
                    else
                    {
                        if (this.BreakTurno != null)
                        {
                            return (fin - this.BreakTurno.fin).TotalHours;
                        }
                        else
                        {
                            return 0;
                        }
                    }
                }
                else
                {
                    return 0;
                }
            }
        }

        [DataMember]
        public string rangoHorasTurno
        {
            get
            {
                string rangoHoras = string.Empty;
                string horaInicio = this.inicio.ToString("HH:mm");
                string horaFin = this.fin.ToString("HH:mm");

                if (this.BreakTurno != null)
                {
                    string horaInicioBreak = this.BreakTurno.inicio.ToString("HH:mm");
                    string horaFinBreak = this.BreakTurno.fin.ToString("HH:mm");
                    rangoHoras = string.Format("{0} - {1} / {2} - {3}", horaInicio, horaInicioBreak, horaFinBreak, horaFin);
                }
                else
                {
                    rangoHoras = string.Format("{0} - {1}", horaInicio, horaFin);
                }

                return rangoHoras;
            }
        }

        [DataMember]
        public double horasReales
        {
            get
            {
                if (BreakTurno != null)
                {
                    return horas - (BreakTurno.fin - BreakTurno.inicio).Hours;
                }
                else
                {
                    return horas;
                }   
            }
        }
    }


    [Serializable, DataContract]
    [XmlType("workBreak")]
    public class PlantillaBreak
    {
        private DateTime _inicio;
        private DateTime _fin;

        [XmlAttribute("shc_work_sched_break_pk")]
        [DataMember]
        public int idBreak { get; set; }

        [XmlAttribute("break_start")]
        [DataMember]
        public DateTime inicio
        {
            get { return _inicio.ToLocalTime(); }
            set { _inicio = value; }
        }

        [XmlAttribute("break_end")]
        [DataMember]
        public DateTime fin
        {
            get { return _fin.ToLocalTime(); }
            set { _fin = value; }
        }
    }
}
