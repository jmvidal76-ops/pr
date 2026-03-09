using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Almacen.ControlStock
{
    public class AvisoStockMMPPFabricacionDto
    {
        public int IdAviso { get; set; }
        public string Semaforo { get; set; }
        public string IdMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public int? IdUbicacion { get; set; }
        public string Ubicacion { get; set; }
        public string DescripcionUbicacion { get; set; }
        public string DestinatariosMailNivelCritico { get; set; }
        public decimal CantidadNivelCritico { get; set; }
        public string DestinatariosMailNivelAviso { get; set; }
        public decimal CantidadNivelAviso { get; set; }
        public decimal CantidadActual { get; set; }
        public string Unidad { get; set; }
        public string CreadoPor { get; set; }
        public string ActualizadoPor { get; set; }
        public string TextoCuerpoCorreo { get; set; }
    }
}
