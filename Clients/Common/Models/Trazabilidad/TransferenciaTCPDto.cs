using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Trazabilidad
{
    public class TransferenciaTCPDto
    {
        public string IdLinea { get; set; }
        public int IdLoteOrigen { get; set; }
        public int IdTipoMaterialMovimientoOrigen { get; set; }
        public decimal Cantidad { get; set; }
        public string IdLineaEnvasado { get; set; }
        public DateTime FechaInicioTransferencia { get; set; }
        public DateTime FechaFinTransferencia { get; set; }
        public string Unidad { get; set; }
        public int IdProceso { get; set; }
        public string IdMaterial { get; set; }
        public string LoteMES { get; set; }
        public string TipoMaterial { get; set; }
        public string ClaseMaterial { get; set; }
        public bool RestarCantidadEnOrigen { get; set; }
    }
}
