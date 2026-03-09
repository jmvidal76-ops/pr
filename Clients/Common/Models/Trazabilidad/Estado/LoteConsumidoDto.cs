using System;

namespace Common.Models.Trazabilidad.Estado
{
    public class LoteConsumidoDto
    {
        public Nullable<System.DateTime> FECHA_ENTRADA_PLANTA { get; set; }
        public string LOTE_MES { get; set; }
        public string REFERENCIA_MES { get; set; }
        public string MATERIAL { get; set; }
        public string TIPO_MATERIAL { get; set; }
        public string CLASE_MATERIAL { get; set; }
        public string ID_PROVEEDOR { get; set; }
        public string PROVEEDOR { get; set; }
        public string LOTE_PROVEEDOR { get; set; }
        public string UNIDADES { get; set; }
        public string UBICACION { get; set; }
        public Nullable<System.DateTime> FECHA_INICIO_CONSUMO { get; set; }
        public Nullable<System.DateTime> FECHA_FIN_CONSUMO { get; set; }
        public Nullable<System.DateTime> FECHA_INICIO_ETIQUETA { get; set; }
        public Nullable<System.DateTime> FECHA_FIN_ETIQUETA { get; set; }
        public Nullable<System.DateTime> FECHA_INICIO_CONSUMO_CODIFICADOR { get; set; }
        public Nullable<System.DateTime> FECHA_FIN_CONSUMO_CODIFICADOR { get; set; }
        public Nullable<decimal> CANTIDAD_INICIAL { get; set; }

    }
}