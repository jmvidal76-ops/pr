using System;
using System.Collections.Generic;

namespace Common.Models.Trazabilidad.Estado
{
    public class PaletMMPPDto
    {
        public string IdLoteMES { get; set; }
        public int? IdProveedor { get; set; }
        public string LoteProveedor { get; set; }
        public int? CantPaletasExtra { get; set; }
        public string Codigo_JDE { get; set; }
        public string IdLoteMESMMPP { get; set; }
        public Nullable<System.DateTime> Fecha { get; set; }
        public Nullable<System.Int32> NumLinea { get; set; }
        public string SSCC { get; set; }
        public string IdLoteMESProductoAcabado { get; set; }
        public string Referencia { get; set; }
        public string WO { get; set; }
        public int Minutos { get; set; }
        public List<int> LotesEnvasado { get; set; }
        public int EnvasesPorPalet { get; set; }
    }
}
