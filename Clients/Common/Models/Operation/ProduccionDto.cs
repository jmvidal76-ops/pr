using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Operation
{
    public class ProduccionDto
    {
        public long IdProduccion { get; set; }
        public int? IdEtiqueta { get; set; }
        public string Linea { get; set; }
        public string Referencia { get; set; }
        public DateTime EtiquetaCreatedAt { get; set; }
        public string ParticionWO { get; set; }
        public string SSCC { get; set; }
        public string IdLotMes { get; set; }
        public string Estado { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? LastModifiedMesAt { get; set; }
        public string LastModifiedMes { get; set; }
        public DateTime? EntradaAlmacenAt { get; set; }
        public string MotivoCuarentena { get; set; }
        public string MotivoBloqueo { get; set; }
        public int? Picos { get; set; }
        public string Ubicacion { get; set; }
        public string DescripCliente { get; set; }
        public DateTime? SalidaAlmacenAt { get; set; }
        public int? Consolidado { get; set; }
        public DateTime? LastModifiedSgaAt { get; set; }
        public string LastModifiedSga { get; set; }
        public string LastModifiedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public int? VelocidadNominalProducto { get; set; }
        public DateTime? CuarentenaAt { get; set; }
        public DateTime? BloqueoAt { get; set; }
        public string CodigoCaja { get; set; }
        public DateTime EtiquetaProducedAt { get; set; }
    }
}
