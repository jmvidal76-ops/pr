using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Fabricacion
{
    public class LoteAsociadoDto
    {
        public int IdLoteMateriaPrima { get; set; }
        public string IdLoteMES { get; set; }
        public string IdMaterial { get; set; }
        public string DescMaterial { get; set; }
        public Nullable<int> IdUbicacion { get; set; }
        public Nullable<int> IdPlantillaConsumo { get; set; }
        public Nullable<decimal> CantidadInicial { get; set; }
        public Nullable<decimal> CantidadActual { get; set; }
        public string Unidad { get; set; }
        public Nullable<System.DateTime> FechaEntradaUbicacion { get; set; }
        public bool Asociado { get; set; }
        public Nullable<int> Orden { get; set; }
        public Nullable<int> IdPoliticaVaciado { get; set; }
        public Nullable<System.DateTime> FechaCaducidad { get; set; }
        public bool HabilitarSeleccion { get; set; }
        public string LoteProveedor { get; set; }
    }
}
