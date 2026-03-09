using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_ConsolidadoTurnos
    {
        public long IdConsolidadoTurno { get; set; }
        public int IdTurno { get; set; }
        public string IdLinea { get; set; }
        public DateTime FechaTurno { get; set; }
        public DateTime InicioTurno { get; set; }
        public DateTime FinTurno { get; set; }
        public int IdTipoTurno { get; set; }
        public double OEECritico { get; set; }
        public double OEEObjetivo { get; set; }
        public double IC { get; set; }
        public double Rendimiento { get; set; }
        public double OEE { get; set; }
        public string SemaforoColor { get; set; }
        public bool ArranqueWO { get; set; }
        public bool FinalizacionWO { get; set; }
        public string ArranqueWOSemaforo { get; set; }
        public string FinalizacionWOSemaforo { get; set; }
        public int GrupoIC { get; set; }
        public DateTime? FechaModifRecalculoIC { get; set; }
        public int TiempoVaciadoTren { get; set; }
        public string Comentario { get; set; }
        public int PaletsDespaletizadora { get; set; }
        public int EnvasesLlenadora { get; set; }
        public int CajasPacksEmpaquetadora { get; set; }
        public int PaletsPaletizadora { get; set; }
        public int EtiquetadoraPalets { get; set; }
        public int RechazosVacios { get; set; }
        public int RechazosLlenos { get; set; }
        public int Cambios { get; set; }
        public int Arranques { get; set; }
        public DateTime InicioTurnoLocal { get { return InicioTurno.ToLocalTime(); } }
        public DateTime FinTurnoLocal { get { return FinTurno.ToLocalTime(); } }

        public string TipoTurno
        {
            get
            {
                switch (IdTipoTurno) { case 1: return "MAÑANA"; case 2: return "TARDE"; case 3: return "NOCHE"; }
                return "DESCONOCIDO";
            }
        }
    }
}