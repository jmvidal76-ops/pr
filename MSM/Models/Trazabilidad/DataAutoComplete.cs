using Common.Models.Transportes;
using Common.Models.Transportista;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Trazabilidad
{
    public class DataAutoComplete
    {
        public int ID { get; set; }
        public string Nombre { get; set; }
        public string Tipo { get; set; }
        public int IdAlbaran { get; set; }
        public int? IdProveedor { get; set; }
        public int? IdOperador { get; set; }
        public string NombreOperador { get; set; }
        public int? IdProducto { get; set; }
        public string MatriculaRemolque { get; set; }
        public string Destinatario { get; set; }
        public int? PesoMaximo { get; set; }
        public TransportistaDto Transportista { get; set; }
    }
}