using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_ParosPerdidas
    {
        public long Id { get; set; }
        public short? IdTipoParoPerdida { get; set; }
        public string TipoParoPerdida { get; set; }
        public int? IdLinea { get; set; }
        public string NumeroLineaDescripcion { get; set; }
        public string DescLinea { get; set; }
        public int? Turno { get; set; }
        public DateTime FechaTurno { get; set; }
        public string IdTipoTurno { get; set; }
        public string NombreTipoTurno { get; set; }
        public DateTime? InicioLocal { get; set; }
        public DateTime? FinLocal { get; set; }
        public string EquipoNombre { get; set; }
        public string EquipoDescripcion { get; set; }
        public string EquipoConstructivoId { get; set; }
        public string EquipoConstructivoNombre { get; set; }
        public string MaquinaCausaId { get; set; }
        public string MaquinaCausaNombre { get; set; }
        public string MotivoNombre { get; set; }
        public string CausaNombre { get; set; }
        public string Descripcion { get; set; }
        public string Observaciones { get; set; }
        public string Duracion { get; set; }
        public double DuracionSegundos { get; set; }
        public double? DuracionMenores { get; set; }
        public double? DuracionBajaVel { get; set; }
        public double NumeroParoMenores { get; set; }
        public string MotivoID { get; set; }
        public string CausaID { get; set; }
        public string EquipoId { get; set; }
        public short? Justificado { get; set; }
        public bool Asociado { get; set; }
        public int? NumOT { get; set; }
    }
}