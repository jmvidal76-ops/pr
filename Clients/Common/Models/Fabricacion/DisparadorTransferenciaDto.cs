using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Fabricacion
{
    public class DisparadorTransferenciaDto
    {
        public int IdDisparadorTransferencia { get; set; }
        public int IdPlantillaConsumo { get; set; }
        public int IdPrefijoLoteSAI { get; set; }
        public int IdMaterialSAI { get; set; }
        public int IdUbicacionOrigen { get; set; }
        public int IdUbicacionDestino { get; set; }
        public string NombreUbicacionOrigen { get; set; }
        public string NombreUbicacionDestino { get; set; }
        public string NombrePrefijo { get; set; }
        public string NombreMaterial { get; set; }
    }
}
