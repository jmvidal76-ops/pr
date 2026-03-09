using MSM.BBDD.Model;
using MSM.Models.Envasado;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_CuadroMandoPlanta
    {
        public object linea { get; set; }
        public string idLinea { get; set; }
        public Turno turno { get; set; }
        public int IdTurno { get; set; }
        public int EnvasesTurno { get; set; }
        public int PaletsTurno { get; set; }
        public double OEETurno { get; set; }
        public bool turnoProductivo { get; set; }
        public string TurnoActualSemaforo { get; set; }
        public string TurnoAnteriorSemaforo { get; set; }
        public string ArranqueWOSemaforo { get; set; }
        public string FinalizacionWOSemaforo { get; set; }
        public TotalesSemanaCuadroMando TotalesSemana { get; set; }
    }
}