using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class AccionMejora
    {
        public enum TiposAccionMejora {
            ParosPerdidas = 0,
            Arranques = 1,
            Cambios = 2
        }

        public long id { get; set; }
        public DateTime  fechaAlta { get; set; }
        public string  usuario { get; set; }

        private DateTime? _fechaFinalizada;
        public DateTime? fechaFinalizada {
            get
            {
                if (_fechaFinalizada.HasValue)
                {
                    return _fechaFinalizada.Value.ToLocalTime();
                }
                else
                {
                    return null;
                }
            }
            set 
            {
                _fechaFinalizada = value;
            }
        }

        public string descripcionProblema { get; set; }
        public string causa { get; set; }
        public string accionPropuesta { get; set; }
        public string observaciones { get; set; }
        public TiposAccionMejora tipo { get; set; }

        public string idLinea { get; set; }
        public string numeroLinea { get; set; }
        public string numeroLineaDescripcion { get; set; }
        public string nombreLinea { get; set; }

        public string idMaquina { get; set; }
        public string nombreMaquina { get; set; }

        public string idEquipoConstructivo { get; set; }
        public string nombreEquipoConstructivo { get; set; }

        public List<ParoPerdida> parosMayores { get; set; }
        public double TiempoParos { get; set; }

        public int idTurno { get; set; }

        public DateTime fechaTurno { get; set; }
        public string idTipoTurno { get; set; }
        public string tipoTurno { get; set; }
    }
}