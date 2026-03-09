using System;

namespace Common.Models.Trazabilidad.Estado
{
    public class InfoLoteProductoAcabadoDto
    {
        public string LOTE_MES { get; set; }
        public string SSCC { get; set; }
        public System.DateTime FECHA_PRODUCCION { get; set; }
        public string LINEA { get; set; }
        public string MATERIAL { get; set; }
        public string WO { get; set; }
        public Nullable<int> ENVASES_PALET { get; set; }

        public string LOTE_PRODUCTO_ACABADO { get; set; }
    }
}