using System;

namespace MSM.Mappers.DTO.Alt
{
    public class DTO_VariacionGasesArranquesEnvasado
    {
        public int IdVariacionGasesArranquesEnvasado { get; set; }
        public string Ubicacion { get; set; }
        public string Codigo_JDE { get; set; }
        public string DescripcionMaterial { get; set; }
        public DateTime? FechaArranque { get; set; }
        public string LoteTCP{ get; set; }
        public string LoteLlenadora { get; set; }        
        public decimal O2TCP { get; set; }
        public decimal O2Llenadora { get; set; }
        public decimal DiferenciaO2 { get; set; }
        public decimal CO2TCP { get; set; }
        public decimal CO2Llenadora { get; set; }
        public decimal DiferenciaCO2 { get; set; }

        public DateTime? Creado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime? Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
    }

}