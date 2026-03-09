using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace MSM.DTO
{
    public class DTO_Stock
    {
        public string ID_TIPO_MATERIAL { get; set; }
        public string TIPO_MATERIAL { get; set; }
        public string ID_CLASE_MATERIAL { get; set; }
        public string CLASE_MATERIAL { get; set; }
        public string REFERENCIA_MES { get; set; }
        public string ID_MATERIAL { get; set; }
        public string MATERIAL { get; set; }
        public string LOTE_MES { get; set; }
        public string LOTE_PROVEEDOR { get; set; }
        public decimal? CANTIDAD_INICIAL { get; set; }
        public decimal? CANTIDAD_ACTUAL { get; set; }
        public string UNIDADES { get; set; }
        public string PRIORIDAD { get; set; }
        public DateTime? FECHA_ENTRADA_PLANTA { get; set; }
        public DateTime? FECHA_ENTRADA_UBICACION { get; set; }
        public DateTime? FECHA_INICIO_CONSUMO { get; set; }
        public DateTime? FECHA_FIN_CONSUMO { get; set; }
        public DateTime? FECHA_CONSUMO { get; set; }
        public DateTime? FECHA_INICIO_CADUCIDAD { get; set; }
        public DateTime? FECHA_FIN_CADUCIDAD { get; set; }
        public DateTime? FECHA_INICIO_ETIQUETA { get; set; }
        public DateTime? FECHA_FIN_ETIQUETA { get; set; }
        public int? MINUTO_VIAJE_ENVASE { get; set; }
        public DateTime? FECHA_CADUCIDAD { get; set; }
        public DateTime? FECHA_CUARENTENA { get; set; }
        public DateTime? FECHA_BLOQUEO { get; set; }
        public DateTime? FECHA_FABRICACION { get; set; }
        public int? ID_ALMACEN { get; set; }
        public string ALMACEN { get; set; }
        public int? ID_ZONA { get; set; }
        public string ZONA { get; set; }
        public string ID_PROVEEDOR { get; set; }
        public string PROVEEDOR { get; set; }
        public int? ID_UBICACION { get; set; }
        public string UBICACION { get; set; }
        public string DESCRIPCION_UBICACION { get; set; }
        public int? ID_TIPO_UBICACION { get; set; }
        public string TIPO_UBICACION { get; set; }
        public string UBICACION_MES { get; set; }
        public bool? LOTE_CONSUMIDO { get; set; }
        public string ESTADO_UBICACION { get; set; }
        public string MOTIVO_BLOQUEO { get; set; }
        public string MOTIVO_CUARENTENA { get; set; }
        public int UBICACION_ORIGEN { get; set; }
        public DateTime? DEFECTUOSO { get; set; }
        public string CODIGO_JDE { get; set; }
        public Nullable<int> GRUPO { get; set; }
        public string POLITICA_VACIADO { get; set; }
        public string ID_UNIDAD { get; set; }
        public int ID_LOTE_MMPP { get; set; }
        public string SSCC { get; set; }
        public int? ID_PROCESO { get; set; }
        public string PROCESO { get; set; }
        public int ID_ESTADO_LIMS { get; set; }
        public string COLOR_ESTADO_LIMS { get; set; }
        public bool ARCHIVOS_ADJUNTOS { get; set; }
        public string NOTAS { get; set; }

        public string UBICACION_CON_DESCRIPTIVO { 
                get { return string.Concat(this.UBICACION, this.DESCRIPCION_UBICACION != null ? " - " : "", this.DESCRIPCION_UBICACION); } 
                set { } 
        }
    }
}