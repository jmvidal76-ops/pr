using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Almacen
{
    public class JDERecepcionMaterialDto
    {
        public int CodigoRecepcion { get; set; }
        public Nullable<System.DateTime> FechaRecepcion { get; set; }
        public Nullable<int> CodigoPlanta { get; set; }
        public string CodigoMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public string CodigoProveedor { get; set; }
        public string DescripcionProveedor { get; set; }
        public string LoteProveedor { get; set; }
        public string Albaran { get; set; }
        public Nullable<int> PosicionAlbaran { get; set; }
        public Nullable<decimal> Cantidad { get; set; }
        public string Unidad { get; set; }
        public string LoteMes { get; set; }
        public string MatriculaCamion { get; set; }
        public string TipoDocumento { get; set; }
        public string NumPedidoMSM { get; set; }
        public Nullable<int> LineaPedido { get; set; }
        public string UltimaAccionMes { get; set; }
        public Nullable<System.DateTime> FechaHoraModificacion { get; set; }
        public Nullable<int> ProcesadaJDE { get; set; }

    }

}
